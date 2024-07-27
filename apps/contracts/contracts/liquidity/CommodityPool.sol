// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenAuthority.sol";
import "../HederaResponseCodes.sol";

contract CommodityPool {
    struct Listing {
        address producer;
        int64 quantity;
        uint256 price;
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

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    mapping(address => CTFLiquidity) public ctfLiquidity;
    address[] public ctfs;

    event ListingAdded(uint256 indexed listingId, address indexed producer, int64 quantity, uint256 price);
    event ListingSold(uint256 indexed listingId, address indexed buyer, int64 quantity, uint256 price);
    event LiquidityAdded(address indexed ctf, uint256 amount, uint256 minPrice, uint256 maxPrice);
    event LiquidityRemoved(address indexed ctf, uint256 amount);

    constructor(address _tokenAddress, address _tokenAuthority, address _commodityExchange) {
        tokenAddress = _tokenAddress;
        tokenAuthority = TokenAuthority(_tokenAuthority);
        commodityExchange = _commodityExchange;
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == commodityExchange, "Only CommodityExchange can call this function");
        _;
    }

    function addListing(address producer, int64 quantity, uint256 price) external onlyCommodityExchange {
        uint256 listingId = listingCount++;
        listings[listingId] = Listing(producer, quantity, price, true);

        emit ListingAdded(listingId, producer, quantity, price);

        _checkForCTFMatch(listingId);
    }

    function purchaseCommodity(address buyer, int64 quantity, uint256 maxPrice) external payable onlyCommodityExchange {
        address ctf = _findMatchingCTF(quantity, maxPrice);
        require(ctf != address(0), "No matching liquidity found");

        uint256 totalPrice = uint256(int256(quantity)) * ctfLiquidity[ctf].minPrice;
        require(msg.value >= totalPrice, "Insufficient payment");

        tokenAuthority.transferToken(tokenAddress, ctf, buyer, quantity);
        ctfLiquidity[ctf].amount -= totalPrice;
        payable(ctf).transfer(totalPrice);

        emit ListingSold(0, buyer, quantity, ctfLiquidity[ctf].minPrice);
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

        emit LiquidityAdded(ctf, msg.value, minPrice, maxPrice);
    }

    function removeLiquidity(address ctf, uint256 amount) external onlyCommodityExchange {
        require(ctfLiquidity[ctf].amount >= amount, "Insufficient liquidity");

        ctfLiquidity[ctf].amount -= amount;
        payable(ctf).transfer(amount);

        emit LiquidityRemoved(ctf, amount);
    }

    function _checkForCTFMatch(uint256 listingId) internal {
        Listing storage listing = listings[listingId];
        address ctf = _findMatchingCTF(listing.quantity, listing.price);

        if (ctf != address(0)) {
            tokenAuthority.transferToken(tokenAddress, listing.producer, ctf, listing.quantity);
            uint256 quantity = uint256(int256(listing.quantity));
            ctfLiquidity[ctf].amount -= quantity * listing.price;
            payable(listing.producer).transfer(quantity * listing.price);

            emit ListingSold(listingId, ctf, listing.quantity, listing.price);
            listing.active = false;
        }
    }

    function _findMatchingCTF(int64 quantity, uint256 price) internal view returns (address) {
        for (uint i = 0; i < ctfs.length; i++) {
            address ctf = ctfs[i];
            if (ctfLiquidity[ctf].amount >= uint256(int256(quantity)) * price &&
            price >= ctfLiquidity[ctf].minPrice &&
                price <= ctfLiquidity[ctf].maxPrice) {
                return ctf;
            }
        }
        return address(0);
    }

    function getListingDetails(uint256 listingId) external view returns (address, int64, uint256, bool) {
        Listing storage listing = listings[listingId];
        return (listing.producer, listing.quantity, listing.price, listing.active);
    }

    function getCTFLiquidityDetails(address ctf) external view returns (uint256, uint256, uint256) {
        CTFLiquidity storage liquidity = ctfLiquidity[ctf];
        return (liquidity.amount, liquidity.minPrice, liquidity.maxPrice);
    }

    function getActiveCTFs() external view returns (address[] memory) {
        return ctfs;
    }

    function getActiveListingsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].active) {
                count++;
            }
        }
        return count;
    }

    function getTotalLiquidity() external view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < ctfs.length; i++) {
            total += ctfLiquidity[ctfs[i]].amount;
        }
        return total;
    }
}
