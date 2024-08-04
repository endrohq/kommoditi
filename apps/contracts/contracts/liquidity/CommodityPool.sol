// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenAuthority.sol";
import "../HederaResponseCodes.sol";

contract CommodityPool {
    struct Listing {
        address producer;
        int64[] serialNumbers;
        uint256 dateOffered;
        bool active;
    }

    struct CTFLiquidity {
        uint256 amount;
        uint256 minPrice;
        uint256 maxPrice;
    }

    address public tokenAddress;
    TokenAuthority public tokenAuthority;
    address public commodityExchange;

    uint256 public totalLiquidity;
    // In Hedera, 1 HBAR is represented as 100,000,000 tinybar
    uint256 public constant BASE_PRICE = 100_000_000;
    uint256 public currentPrice;

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    mapping(address => CTFLiquidity) public ctfLiquidity;
    address[] public ctfs;

    // Price adjustment factors
    uint256 constant PRICE_ADJUSTMENT_FACTOR = 1000; // 0.1% adjustment
    uint256 constant PRICE_ADJUSTMENT_PRECISION = 1000000;

    // Fee percentage for facilitating trades
    uint256 constant FEE_PERCENTAGE = 500;  // 5% fee (500 basis points)
    uint256 constant FEE_PRECISION = 10000;  // 100% = 10000

    event ListingAdded(uint256 indexed listingId, address indexed producer, int64[] serialNumbers);
    event ListingSold(uint256 indexed listingId, address indexed buyer, int64 serialNumber, uint256 price);
    event LiquidityChanged(address ctf, uint256 amount, uint256 minPrice, uint256 maxPrice, bool isAdding);
    event CTFPurchase(address indexed ctf, address indexed producer, int64[] serialNumber, uint256 price);
    event FPPurchase(address indexed fp, address indexed ctf, int64 serialNumber, uint256 price, uint256 fee);
    event PriceUpdated(uint256 newPrice);

    event SerialNumberStatusChanged(
        int64 indexed serialNumber,
        address indexed previousOwner,
        address indexed newOwner,
        string status,
        uint256 timestamp
    );

    constructor(address _tokenAddress, address _tokenAuthority, address _commodityExchange) {
        tokenAddress = _tokenAddress;
        tokenAuthority = TokenAuthority(_tokenAuthority);
        commodityExchange = _commodityExchange;
        currentPrice = BASE_PRICE;
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == commodityExchange, "Only CommodityExchange can call this function");
        _;
    }

    function addListing(address producer, int64[] memory serialNumbers) external onlyCommodityExchange {
        uint256 listingId = listingCount++;
        listings[listingId] = Listing(producer, serialNumbers, block.timestamp, true);

        emit ListingAdded(listingId, producer, serialNumbers);

        // Adjust price downwards when new supply is added
        adjustPrice(false);

        _checkForCTFMatch(listingId);
    }

    function getListingDetails(uint256 listingId) external view returns (address, int64[] memory, bool) {
        Listing storage listing = listings[listingId];
        return (listing.producer, listing.serialNumbers, listing.active);
    }

    function getOffers() external view returns (Listing[] memory) {
        Listing[] memory listingToReturn = new Listing[](listingCount);
        for (uint256 i = 0; i < listingCount; i++) {
            listingToReturn[i] = listings[i];
        }
        return listingToReturn;
    }

    function provideLiquidity(address ctf, uint256 minPrice, uint256 maxPrice) external payable onlyCommodityExchange {
        require(msg.value > 0, "Must provide liquidity");
        require(minPrice < maxPrice, "Invalid price range");

        if (ctfLiquidity[ctf].amount == 0) {
            ctfs.push(ctf);
        }

        ctfLiquidity[ctf].amount += msg.value;
        ctfLiquidity[ctf].minPrice = minPrice;
        ctfLiquidity[ctf].maxPrice = maxPrice;

        totalLiquidity += msg.value;

        emit LiquidityChanged(ctf, msg.value, minPrice, maxPrice, true);
    }

    function removeLiquidity(address ctf, uint256 amount) external onlyCommodityExchange {
        require(ctfLiquidity[ctf].amount >= amount, "Insufficient liquidity");

        ctfLiquidity[ctf].amount -= amount;
        totalLiquidity -= amount;

        payable(ctf).transfer(amount);

        emit LiquidityChanged(ctf, amount, ctfLiquidity[ctf].minPrice, ctfLiquidity[ctf].maxPrice, false);
    }

    function purchaseCommodity(address buyer, int64 serialNumber) external payable onlyCommodityExchange {
        uint256 listingId = findListingBySerialNumber(serialNumber);
        require(listingId < listingCount, "Listing not found");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");

        uint256 basePrice = currentPrice;
        uint256 fee = (basePrice * FEE_PERCENTAGE) / FEE_PRECISION;
        uint256 totalPrice = basePrice + fee;

        require(msg.value >= totalPrice, "Insufficient payment");

        address ctf = _findMatchingCTF(basePrice);
        require(ctf != address(0), "No matching CTF found");

        tokenAuthority.transferNFT(tokenAddress, listing.producer, buyer, serialNumber);
        ctfLiquidity[ctf].amount -= basePrice;
        totalLiquidity -= basePrice;
        ctfLiquidity[ctf].amount += fee;
        payable(ctf).transfer(basePrice);
        payable(listing.producer).transfer(fee);

        emit FPPurchase(buyer, ctf, serialNumber, basePrice, fee);
        emit ListingSold(listingId, buyer, serialNumber, basePrice);

        listing.active = false;

        // Adjust price upwards when a purchase is made
        adjustPrice(true);
    }

    function adjustPrice(bool increase) internal {
        if (increase) {
            currentPrice = currentPrice * (PRICE_ADJUSTMENT_PRECISION + PRICE_ADJUSTMENT_FACTOR) / PRICE_ADJUSTMENT_PRECISION;
        } else {
            currentPrice = currentPrice * (PRICE_ADJUSTMENT_PRECISION - PRICE_ADJUSTMENT_FACTOR) / PRICE_ADJUSTMENT_PRECISION;
        }
        emit PriceUpdated(currentPrice);
    }

    function _checkForCTFMatch(uint256 listingId) internal {
        Listing storage listing = listings[listingId];
        address ctf = _findMatchingCTF(currentPrice);

        if (ctf != address(0)) {
            uint256 totalPrice = currentPrice * listing.serialNumbers.length;
            require(ctfLiquidity[ctf].amount >= totalPrice, "Insufficient CTF liquidity");

            for (uint i = 0; i < listing.serialNumbers.length; i++) {
                tokenAuthority.transferNFT(tokenAddress, listing.producer, ctf, listing.serialNumbers[i]);
            }

            ctfLiquidity[ctf].amount -= totalPrice;
            totalLiquidity -= totalPrice;
            payable(listing.producer).transfer(totalPrice);

            emit CTFPurchase(ctf, listing.producer, listing.serialNumbers, currentPrice);
            listing.active = false;

            // Adjust price upwards when a CTF purchase is made
            adjustPrice(true);
        }
    }

    function _findMatchingCTF(uint256 price) internal view returns (address) {
        for (uint i = 0; i < ctfs.length; i++) {
            address ctf = ctfs[i];
            if (ctfLiquidity[ctf].amount >= price &&
            price >= ctfLiquidity[ctf].minPrice &&
                price <= ctfLiquidity[ctf].maxPrice) {
                return ctf;
            }
        }
        return address(0);
    }

    function findListingBySerialNumber(int64 serialNumber) internal view returns (uint256) {
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].active) {
                for (uint256 j = 0; j < listings[i].serialNumbers.length; j++) {
                    if (listings[i].serialNumbers[j] == serialNumber) {
                        return i;
                    }
                }
            }
        }
        return listingCount;
    }

    function getCTFLiquidityDetails(address ctf) external view returns (uint256, uint256, uint256) {
        CTFLiquidity storage liquidity = ctfLiquidity[ctf];
        return (liquidity.amount, liquidity.minPrice, liquidity.maxPrice);
    }

    function getActiveCTFs() external view returns (address[] memory) {
        return ctfs;
    }

    function getTotalLiquidity() external view returns (uint256) {
        return totalLiquidity;
    }

    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }
}
