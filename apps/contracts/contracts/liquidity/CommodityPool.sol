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

    struct CTFLiquidityView {
        address ctf;
        uint256 amount;
        // Stored with 1e2 precision to allow for 2 decimal places in our UI
        uint256 minPrice;
        // Stored with 1e2 precision to allow for 2 decimal places in our UI
        uint256 maxPrice;
    }

    address public tokenAddress;
    TokenAuthority public tokenAuthority;
    address public commodityExchange;

    uint256 public totalLiquidity;
    uint256 public weightedTotalPrice;
    uint256 public currentPrice;

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    mapping(address => CTFLiquidity) public ctfLiquidity;
    address[] public ctfs;

    // Fee percentage for facilitating trades
    uint256 constant FEE_PERCENTAGE = 500;  // 5% fee (500 basis points)
    uint256 constant FEE_PRECISION = 10000;  // 100% = 10000

    event ListingAdded(uint256 indexed listingId, address indexed producer, int64[] serialNumbers);
    event ListingSold(uint256 indexed listingId, address indexed buyer, int64 serialNumber, uint256 price);
    event LiquidityChanged(address ctf, uint256 amount, uint256 minPrice, uint256 maxPrice, bool isAdding);
    event CTFPurchase(address indexed ctf, address indexed producer, int64[] serialNumber, uint256 price);
    event FPPurchase(address indexed fp, address indexed ctf, int64 serialNumber, uint256 price, uint256 fee);
    event PriceUpdated(uint256 newPrice, uint256 timestamp);

    constructor(address _tokenAddress, address _tokenAuthority, address _commodityExchange) {
        tokenAddress = _tokenAddress;
        tokenAuthority = TokenAuthority(_tokenAuthority);
        commodityExchange = _commodityExchange;
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == commodityExchange, "Only CommodityExchange can call this function");
        _;
    }

    function addListing(address producer, int64[] memory serialNumbers) external onlyCommodityExchange {
        uint256 listingId = listingCount++;
        listings[listingId] = Listing(producer, serialNumbers, block.timestamp, true);

        emit ListingAdded(listingId, producer, serialNumbers);

        _checkForCTFMatch(listingId);
    }

    function getListingDetails(uint256 listingId) external view returns (address, int64[] memory, bool) {
        Listing storage listing = listings[listingId];
        return (listing.producer, listing.serialNumbers, listing.active);
    }

    function getActiveListingsCount() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].active) {
                count++;
            }
        }
        return count;
    }

    function getListings() external view returns (Listing[] memory) {
        Listing[] memory activeListings = new Listing[](getActiveListingsCount());
        uint256 index = 0;
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        return activeListings;
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
        weightedTotalPrice += msg.value * ((minPrice + maxPrice) / 2);

        emit LiquidityChanged(ctf, msg.value, minPrice, maxPrice, true);

        updatePrice();
    }

    function removeLiquidity(address ctf, uint256 amount) external onlyCommodityExchange {
        require(ctfLiquidity[ctf].amount >= amount, "Insufficient liquidity");

        ctfLiquidity[ctf].amount -= amount;
        totalLiquidity -= amount;
        weightedTotalPrice -= amount * ((ctfLiquidity[ctf].minPrice + ctfLiquidity[ctf].maxPrice) / 2);

        payable(ctf).transfer(amount);

        emit LiquidityChanged(ctf, amount, ctfLiquidity[ctf].minPrice, ctfLiquidity[ctf].maxPrice, false);

        updatePrice();
    }

    function purchaseCommodity(address buyer, int64 serialNumber) external payable onlyCommodityExchange {
        uint256 currentPrice = getCurrentPrice();
        address ctf = _findMatchingCTF(currentPrice);
        require(ctf != address(0), "No matching CTF found");

        uint256 basePrice = currentPrice;
        uint256 fee = (basePrice * FEE_PERCENTAGE) / FEE_PRECISION;
        uint256 totalPrice = basePrice + fee;

        require(msg.value >= totalPrice, "Insufficient payment");

        uint256 listingId = findListingBySerialNumber(serialNumber);
        require(listingId < listingCount, "Listing not found");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");

        tokenAuthority.transferNFT(tokenAddress, listing.producer, buyer, serialNumber);
        ctfLiquidity[ctf].amount -= basePrice;
        totalLiquidity -= basePrice;
        ctfLiquidity[ctf].amount += fee;
        payable(ctf).transfer(basePrice);
        payable(listing.producer).transfer(fee);

        emit FPPurchase(buyer, ctf, serialNumber, currentPrice, fee);
        emit ListingSold(listingId, buyer, serialNumber, currentPrice);

        listing.active = false;
        updatePrice();
    }

    function updatePrice() internal {
        uint256 newPrice = getCurrentPrice();
        if (newPrice != currentPrice) {
            currentPrice = newPrice;
            emit PriceUpdated(currentPrice, block.timestamp);
        }
    }

    function getCurrentPrice() public view returns (uint256) {
        if (totalLiquidity == 0) return 0;
        return weightedTotalPrice / totalLiquidity;
    }

    function _checkForCTFMatch(uint256 listingId) internal {
        Listing storage listing = listings[listingId];
        uint256 currentPrice = getCurrentPrice();
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

            updatePrice();
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

    function getAllCTFLiquidity() external view returns (CTFLiquidityView[] memory) {
        CTFLiquidityView[] memory allLiquidity = new CTFLiquidityView[](ctfs.length);
        for (uint i = 0; i < ctfs.length; i++) {
            address ctf = ctfs[i];
            allLiquidity[i] = CTFLiquidityView({
                ctf: ctf,
                amount: ctfLiquidity[ctf].amount,
                minPrice: ctfLiquidity[ctf].minPrice,
                maxPrice: ctfLiquidity[ctf].maxPrice
            });
        }
        return allLiquidity;
    }
}
