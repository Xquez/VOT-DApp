// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Vehicle Ownership Registry
/// @author
/// @notice Simple vehicle registry for demo purposes
contract VehicleRegistry {
    address public admin;

    struct Vehicle {
        string vehicleId;       // VIN or registration number (unique)
        address owner;          // current owner address
        string model;
        string manufacturer;
        uint256 registeredAt;   // timestamp
        bool exists;
        string ipfsDoc;         // optional: IPFS hash for RC/documents
    }

    // vehicleId => Vehicle
    mapping(string => Vehicle) private vehicles;

    // ownerAddress => list of vehicleIds (not enumerable cheaply, but we can store simple mapping of counts)
    mapping(address => uint256) public ownerVehicleCount;

    event VehicleRegistered(string indexed vehicleId, address indexed owner);
    event OwnershipTransferred(string indexed vehicleId, address indexed from, address indexed to);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOwner(string memory vehicleId) {
        require(vehicles[vehicleId].exists, "Vehicle not registered");
        require(msg.sender == vehicles[vehicleId].owner, "Not vehicle owner");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Register a new vehicle. Only admin (RTO) can register.
    /// @param vehicleId Unique vehicle id (VIN / reg number)
    /// @param owner initial owner address
    /// @param model vehicle model
    /// @param manufacturer vehicle manufacturer
    /// @param ipfsDoc optional IPFS hash for vehicle document
    function registerVehicle(
        string calldata vehicleId,
        address owner,
        string calldata model,
        string calldata manufacturer,
        string calldata ipfsDoc
    ) external onlyAdmin {
        require(!vehicles[vehicleId].exists, "Vehicle already exists");
        vehicles[vehicleId] = Vehicle({
            vehicleId: vehicleId,
            owner: owner,
            model: model,
            manufacturer: manufacturer,
            registeredAt: block.timestamp,
            exists: true,
            ipfsDoc: ipfsDoc
        });
        ownerVehicleCount[owner] += 1;

        emit VehicleRegistered(vehicleId, owner);
    }

    /// @notice Transfer ownership (only current owner can call)
    /// @param vehicleId id
    /// @param newOwner new owner's address
    function transferOwnership(string calldata vehicleId, address newOwner) external onlyOwner(vehicleId) {
        require(newOwner != address(0), "Invalid new owner");
        address prev = vehicles[vehicleId].owner;
        vehicles[vehicleId].owner = newOwner;
        ownerVehicleCount[prev] -= 1;
        ownerVehicleCount[newOwner] += 1;

        emit OwnershipTransferred(vehicleId, prev, newOwner);
    }

    /// @notice Get vehicle details
    function getVehicle(string calldata vehicleId) external view returns (
        string memory _vehicleId,
        address _owner,
        string memory _model,
        string memory _manufacturer,
        uint256 _registeredAt,
        bool _exists,
        string memory _ipfsDoc
    ) {
        Vehicle storage v = vehicles[vehicleId];
        require(v.exists, "Vehicle not found");
        return (v.vehicleId, v.owner, v.model, v.manufacturer, v.registeredAt, v.exists, v.ipfsDoc);
    }

    /// @notice Check if vehicle exists
    function isRegistered(string calldata vehicleId) external view returns (bool) {
        return vehicles[vehicleId].exists;
    }

    /// @notice Allows admin to change admin
    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero admin");
        admin = newAdmin;
    }
}
