// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenAuthority.sol";
import "../HederaResponseCodes.sol";
import "../ParticipantRegistry.sol";
import "hardhat/console.sol";

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
    ParticipantRegistry public participantRegistry;
    address public commodityExchange;

    uint256 public totalLiquidity;

    uint256 public constant ETHEREUM_BASE_PRICE = 1e18; // 18 decimal places
    uint256 public constant HEDERA_BASE_PRICE = 1e8;   // 8 decimal places

    uint256 public currentPrice;

    mapping(address => uint256[]) private producerListings;
    mapping(address => uint256) public producerListingCount;

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    mapping(address => CTFLiquidity) public ctfLiquidity;
    address[] public ctfs;

    // Add these as state variables
    uint256[] public unmatchedListings;

    // Price adjustment factors
    uint256 constant PRICE_ADJUSTMENT_FACTOR = 1000; // 0.1% adjustment
    uint256 constant PRICE_ADJUSTMENT_PRECISION = 1000000;

    // Fee percentage for facilitating trades
    uint256 constant FEE_PERCENTAGE = 500;  // 5% fee (500 basis points)
    uint256 constant FEE_PRECISION = 10000;  // 100% = 10000

    // Mapping to store which CTF owns which serial numbers
    mapping(address => int64[]) public ctfOwnedSerialNumbers;

    // Not in sync with frontend

    event ListingAdded(uint256 indexed listingId, address indexed producer, int64[] serialNumbers, uint256 timestamp);
    event LiquidityChanged(address ctf, uint256 amount, uint256 minPrice, uint256 maxPrice, bool isAdding);
    event CTFPurchase(address indexed ctf, address indexed producer, uint256 listingId, int64[] serialNumbers, uint256 price, uint256 totalPrice);
    event CommodityPurchased(
        address indexed buyer,
        address indexed ctf,
        int64[] serialNumbers,
        uint256 quantity,
        uint256 basePrice,
        uint256 ctfFee
    );
    event PriceUpdated(uint256 newPrice);

    event SerialNumberStatusChanged(
        int64 indexed serialNumber,
        address indexed previousOwner,
        address indexed newOwner,
        string status,
        uint256 timestamp
    );

    constructor(address _tokenAddress, address _tokenAuthority, address _commodityExchange, address _participantRegistry, bool isHedera) {
        tokenAddress = _tokenAddress;
        tokenAuthority = TokenAuthority(_tokenAuthority);
        commodityExchange = _commodityExchange;
        participantRegistry = ParticipantRegistry(_participantRegistry);
        currentPrice = isHedera ? HEDERA_BASE_PRICE : ETHEREUM_BASE_PRICE;
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == commodityExchange, "Only CommodityExchange can call this function");
        _;
    }

    function addListing(address producer, int64[] memory serialNumbers) external onlyCommodityExchange {
        uint256 listingId = listingCount++;
        listings[listingId] = Listing(producer, serialNumbers, block.timestamp, true);

        producerListings[producer].push(listingId);
        producerListingCount[producer]++;

        emit ListingAdded(listingId, producer, serialNumbers, block.timestamp);

        adjustPrice(false);

        if (!_tryMatch(listingId)) {
            unmatchedListings.push(listingId);
        }
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

        _tryMatchLiquidity(ctf, msg.value);
    }

    function removeLiquidity(address ctf, uint256 amount) external onlyCommodityExchange {
        require(ctfLiquidity[ctf].amount >= amount, "Insufficient liquidity");

        ctfLiquidity[ctf].amount -= amount;
        totalLiquidity -= amount;

        payable(ctf).transfer(amount);

        emit LiquidityChanged(ctf, amount, ctfLiquidity[ctf].minPrice, ctfLiquidity[ctf].maxPrice, false);
    }

    function purchaseCommodity(address buyer, uint256 quantity) external payable onlyCommodityExchange {
        require(quantity > 0, "Quantity must be greater than 0");

        address ctf = findMatchingCTF(quantity);
        require(ctf != address(0), "No matching CTF found");

        uint256 basePrice = currentPrice * quantity;

        // Get CTF's overhead percentage
        ParticipantRegistry.ParticipantView memory participant = participantRegistry.getParticipantByAddress(ctf);

        uint256 ctfFee = (basePrice * participant.overheadPercentage) / 10000; // Assuming overhead is in basis points
        uint256 totalPrice = basePrice + ctfFee;

        require(msg.value >= totalPrice, "Insufficient payment");

        // Transfer commodities
        int64[] memory purchasedSerialNumbers = transferCommodities(ctf, buyer, quantity);

        // Transfer payment
        payable(ctf).transfer(totalPrice);

        emit CommodityPurchased(buyer, ctf, purchasedSerialNumbers, quantity, basePrice, ctfFee);

        adjustPrice(true);
    }

    function findMatchingCTF(uint256 quantity) internal view returns (address) {
        for (uint i = 0; i < ctfs.length; i++) {
            address ctf = ctfs[i];
            if (ctfOwnedSerialNumbers[ctf].length >= quantity) {
                return ctf;
            }
        }
        return address(0);
    }

    function transferCommodities(address ctf, address buyer, uint256 quantity) internal returns (int64[] memory) {
        require(ctfOwnedSerialNumbers[ctf].length >= quantity, "Insufficient CTF holdings");

        int64[] memory transferredSerialNumbers = new int64[](quantity);
        for (uint i = 0; i < quantity; i++) {
            int64 serialNumber = ctfOwnedSerialNumbers[ctf][ctfOwnedSerialNumbers[ctf].length - 1];
            ctfOwnedSerialNumbers[ctf].pop();
            transferredSerialNumbers[i] = serialNumber;
            tokenAuthority.transferNFT(tokenAddress, ctf, buyer, serialNumber);
        }

        return transferredSerialNumbers;
    }

    function adjustPrice(bool increase) internal {
        if (increase) {
            currentPrice = currentPrice * (PRICE_ADJUSTMENT_PRECISION + PRICE_ADJUSTMENT_FACTOR) / PRICE_ADJUSTMENT_PRECISION;
        } else {
            currentPrice = currentPrice * (PRICE_ADJUSTMENT_PRECISION - PRICE_ADJUSTMENT_FACTOR) / PRICE_ADJUSTMENT_PRECISION;
        }
        emit PriceUpdated(currentPrice);
    }

    function _tryMatch(uint256 listingId) internal returns (bool) {
        Listing storage listing = listings[listingId];
        uint256 totalPrice = currentPrice * listing.serialNumbers.length;

        for (uint i = 0; i < ctfs.length; i++) {
            address ctf = ctfs[i];
            if (ctfLiquidity[ctf].amount >= totalPrice &&
            currentPrice >= ctfLiquidity[ctf].minPrice &&
                currentPrice <= ctfLiquidity[ctf].maxPrice) {
                _executeTrade(listingId, ctf);
                return true;
            }
        }
        return false;
    }

    function _tryMatchLiquidity(address ctf, uint256 amount) internal {
        while (amount > 0 && unmatchedListings.length > 0) {
            uint256 listingId = unmatchedListings[unmatchedListings.length - 1];
            Listing storage listing = listings[listingId];
            uint256 totalPrice = currentPrice * listing.serialNumbers.length;

            console.log("Amount: %s", amount);
            console.log("totalPrice: %s", totalPrice);
            console.log("ctfLiquidity[ctf].minPrice: %s", ctfLiquidity[ctf].minPrice);
            console.log("ctfLiquidity[ctf].maxPrice: %s", ctfLiquidity[ctf].maxPrice);
            console.log("currentPrice: %s", currentPrice);
            if (amount >= totalPrice &&
            currentPrice >= ctfLiquidity[ctf].minPrice &&
                currentPrice <= ctfLiquidity[ctf].maxPrice) {
                _executeTrade(listingId, ctf);
                amount -= totalPrice;
                unmatchedListings.pop();
            } else {
                break;
            }
        }
    }

    function _executeTrade(uint256 listingId, address ctf) internal {
        Listing storage listing = listings[listingId];
        uint256 totalPrice = currentPrice * listing.serialNumbers.length;

        for (uint i = 0; i < listing.serialNumbers.length; i++) {
            tokenAuthority.transferNFT(tokenAddress, listing.producer, ctf, listing.serialNumbers[i]);
        }

        ctfLiquidity[ctf].amount -= totalPrice;
        totalLiquidity -= totalPrice;
        payable(listing.producer).transfer(totalPrice);

        emit CTFPurchase(ctf, listing.producer, listingId, listing.serialNumbers, currentPrice, totalPrice);
        listing.active = false;

        adjustPrice(true);
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

    function getListingsByProducer(address producer) external view returns (Listing[] memory) {
        uint256 count = producerListingCount[producer];
        Listing[] memory producerListingsToReturn = new Listing[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 listingId = producerListings[producer][i];
            producerListingsToReturn[i] = listings[listingId];
        }

        return producerListingsToReturn;
    }

    // This function should be called when a CTF purchases from a producer
    function updateCTFHoldings(address ctf, int64[] memory serialNumbers) internal {
        for (uint i = 0; i < serialNumbers.length; i++) {
            ctfOwnedSerialNumbers[ctf].push(serialNumbers[i]);
        }
    }
}
