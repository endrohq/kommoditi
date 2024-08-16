// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenAuthority.sol";
import "../HederaResponseCodes.sol";
import "../ParticipantRegistry.sol";

contract CommodityPool {
    struct Listing {
        address producer;
        int64[] serialNumbers;
        uint256 dateOffered;
        bool active;
    }

    struct DistributorLiquidity {
        uint256 amount;
        uint256 minPrice;
        uint256 maxPrice;
    }

    address public tokenAddress;
    TokenAuthority public tokenAuthority;
    ParticipantRegistry public participantRegistry;
    address public commodityExchange;

    uint256 public totalLiquidity;
    uint256 public currentPrice;

    mapping(uint256 => Listing) public listings;
    uint256 public listingCount;

    mapping(address => DistributorLiquidity) public distributorLiquidity;
    address[] public distributors;

    mapping(address => uint256) public consumerFunds;

    // Correct implementation of Distributor inventory tracking
    mapping(address => int64[]) public distributorOwnedSerialNumbers;

    // Price adjustment factors
    uint256 constant private PRICE_ADJUSTMENT_FACTOR = 1000; // 0.1% adjustment
    uint256 constant private PRICE_ADJUSTMENT_PRECISION = 1000000;

    // Fee percentage for facilitating trades
    uint256 constant private FEE_PERCENTAGE = 500;  // 5% fee (500 basis points)
    uint256 constant private FEE_PRECISION = 10000;  // 100% = 10000

    uint256 public constant ETHEREUM_BASE_PRICE = 1e18; // 18 decimal places
    uint256 public constant HEDERA_BASE_PRICE = 1e8;   // 8 decimal places

    event ListingAdded(uint256 indexed listingId, address indexed producerId, int64[] serialNumbers, uint256 timestamp);
    event LiquidityChanged(address distributor, uint256 amount, uint256 minPrice, uint256 maxPrice, bool isAdding);
    event DistributorPurchased(address indexed from, address indexed to, uint256 listingId, int64[] serialNumbers, uint256 price, uint256 totalPrice);
    event ConsumerPurchased(address indexed from, address indexed to, int64[] serialNumbers, uint256 price, uint256 totalPrice);
    event PriceUpdated(uint256 newPrice);

    constructor(address _tokenAddress, address _tokenAuthority, address _commodityExchange, address _participantRegistry, bool isHedera) {
        tokenAddress = _tokenAddress;
        tokenAuthority = TokenAuthority(_tokenAuthority);
        commodityExchange = _commodityExchange;
        participantRegistry = ParticipantRegistry(_participantRegistry);
        currentPrice = isHedera ? HEDERA_BASE_PRICE : ETHEREUM_BASE_PRICE;

        emit PriceUpdated(currentPrice);
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == commodityExchange, "Only CommodityExchange can call this function");
        _;
    }

    function addListing(address producer, int64[] memory serialNumbers) external onlyCommodityExchange {
        uint256 listingId = listingCount++;
        listings[listingId] = Listing(producer, serialNumbers, block.timestamp, true);
        emit ListingAdded(listingId, producer, serialNumbers, block.timestamp);
        _tryDistributorAutoBuy(listingId);

        adjustPrice(false);
    }

    function provideLiquidity(address distributor, uint256 minPrice, uint256 maxPrice) external payable onlyCommodityExchange {
        require(msg.value > 0, "Must provide liquidity");
        require(minPrice < maxPrice, "Invalid price range");

        if (distributorLiquidity[distributor].amount == 0) {
            distributors.push(distributor);
        }

        distributorLiquidity[distributor].amount += msg.value;
        distributorLiquidity[distributor].minPrice = minPrice;
        distributorLiquidity[distributor].maxPrice = maxPrice;

        totalLiquidity += msg.value;

        emit LiquidityChanged(distributor, msg.value, minPrice, maxPrice, true);

        _tryDistributorAutoBuyAll(distributor);
    }

    function distributorManualBuy(address distributor, uint256 listingId, uint256 quantity) external onlyCommodityExchange {
        require(listings[listingId].active, "Listing is not active");
        require(listings[listingId].serialNumbers.length >= quantity, "Not enough commodities in listing");

        uint256 totalPrice = currentPrice * quantity;
        require(distributorLiquidity[distributor].amount >= totalPrice, "Insufficient Distributor liquidity");

        _executeDistributorPurchase(distributor, listingId, quantity);
    }

    function consumerProvideFunds(address consumer) external payable onlyCommodityExchange {
        consumerFunds[consumer] += msg.value;
        _tryConsumerAutoBuyAll(consumer);
    }

    function consumerBuyFromDistributor(address consumer, address distributor, uint256 quantity) external onlyCommodityExchange {
        _consumerBuyFromDistributor(consumer, distributor, quantity);
    }

    function _consumerBuyFromDistributor(address consumer, address distributor, uint256 quantity) internal {
        uint256 totalPrice = currentPrice * quantity;
        require(consumerFunds[consumer] >= totalPrice, "Insufficient Consumer funds");
        require(distributorOwnedSerialNumbers[distributor].length >= quantity, "Not enough commodities in Distributor inventory");

        int64[] memory serialNumbers = new int64[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            serialNumbers[i] = distributorOwnedSerialNumbers[distributor][distributorOwnedSerialNumbers[distributor].length - 1];
            distributorOwnedSerialNumbers[distributor].pop();
            tokenAuthority.transferNFT(tokenAddress, distributor, consumer, serialNumbers[i]);
        }

        consumerFunds[consumer] -= totalPrice;
        distributorLiquidity[distributor].amount += totalPrice;

        emit ConsumerPurchased(distributor, consumer, serialNumbers, currentPrice, totalPrice);
    }

    function _tryDistributorAutoBuy(uint256 listingId) internal {
        Listing storage listing = listings[listingId];
        uint256 totalPrice = currentPrice * listing.serialNumbers.length;

        for (uint i = 0; i < distributors.length; i++) {
            address distributor = distributors[i];
            if (distributorLiquidity[distributor].amount >= totalPrice &&
            currentPrice >= distributorLiquidity[distributor].minPrice &&
            currentPrice <= distributorLiquidity[distributor].maxPrice &&
                participantRegistry.isInAddressBook(distributor, listing.producer)) {
                _executeDistributorPurchase(distributor, listingId, listing.serialNumbers.length);
                break;
            }
        }
    }

    function _tryDistributorAutoBuyAll(address distributor) internal {
        for (uint256 i = 0; i < listingCount; i++) {
            if (listings[i].active && participantRegistry.isInAddressBook(distributor, listings[i].producer)) {
                uint256 totalPrice = currentPrice * listings[i].serialNumbers.length;
                if (distributorLiquidity[distributor].amount >= totalPrice &&
                currentPrice >= distributorLiquidity[distributor].minPrice &&
                    currentPrice <= distributorLiquidity[distributor].maxPrice) {
                    _executeDistributorPurchase(distributor, i, listings[i].serialNumbers.length);
                }
            }
        }
    }

    function _tryConsumerAutoBuyAll(address consumer) internal {
        address[] memory approvedDistributors = participantRegistry.getAddressBook(consumer);
        for (uint256 i = 0; i < approvedDistributors.length; i++) {
            address distributor = approvedDistributors[i];
            uint256 availableQuantity = distributorOwnedSerialNumbers[distributor].length;
            uint256 affordableQuantity = consumerFunds[consumer] / currentPrice;
            uint256 quantityToBuy = availableQuantity < affordableQuantity ? availableQuantity : affordableQuantity;

            if (quantityToBuy > 0) {
                _consumerBuyFromDistributor(consumer, distributor, quantityToBuy);
            }
        }
    }

    function _executeDistributorPurchase(address distributor, uint256 listingId, uint256 quantity) internal {
        Listing storage listing = listings[listingId];
        uint256 totalPrice = currentPrice * quantity;

        distributorLiquidity[distributor].amount -= totalPrice;
        payable(listing.producer).transfer(totalPrice);

        for (uint256 i = 0; i < quantity; i++) {
            int64 serialNumber = listing.serialNumbers[listing.serialNumbers.length - 1];
            listing.serialNumbers.pop();
            distributorOwnedSerialNumbers[distributor].push(serialNumber);
            tokenAuthority.transferNFT(tokenAddress, listing.producer, distributor, serialNumber);
        }

        if (listing.serialNumbers.length == 0) {
            listing.active = false;
        }

        emit DistributorPurchased(listing.producer, distributor, listingId, distributorOwnedSerialNumbers[distributor], currentPrice, totalPrice);
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
}
