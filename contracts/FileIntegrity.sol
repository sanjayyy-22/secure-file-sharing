// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.18;

contract FileIntegrity{
    struct FileRecord{
        string filename;
        string ipfsCid;
        address uploader;
        uint256 timestamp;
        mapping(address => bool) sharedWith;
    }
    mapping (string => FileRecord) private files;
    mapping (string => address) private fileOwner;

    event FileUploaded(string fileHash, string filename, string ipfsCid, address uploader);
    event FileShared(string fileHash, address sharedWith);
    event FileDeleted(string fileHash);

    modifier onlyOwner(string memory fileHash) {
        require(fileOwner[fileHash] == msg.sender, "Not the file owner");
        _;
    }

    function uploadFile(string memory fileHash, string memory filename, string memory ipfsCid) public {
        require(bytes(files[fileHash].filename).length == 0, "File already exists");
        FileRecord storage newFile = files[fileHash];
        newFile.filename = filename;
        newFile.ipfsCid = ipfsCid;
        newFile.uploader = msg.sender;
        newFile.timestamp = block.timestamp;
        fileOwner[fileHash] = msg.sender;

        emit FileUploaded(fileHash, filename, ipfsCid, msg.sender);
    }

    function shareFile(string memory fileHash, address user) public onlyOwner(fileHash) {
        require(bytes(files[fileHash].filename).length != 0, "File does not exist");
        files[fileHash].sharedWith[user] = true;

        emit FileShared(fileHash, user);
    }

    function deleteFile(string memory fileHash) public onlyOwner(fileHash) {
        require(bytes(files[fileHash].filename).length != 0, "File does not exist");
        delete files[fileHash];
        delete fileOwner[fileHash];

        emit FileDeleted(fileHash);
    }

    function verifyFile(string memory fileHash) public view returns (bool, string memory, string memory, address, uint256) {
        if (fileOwner[fileHash] == address(0)) return (false, "", "", address(0), 0);
        FileRecord storage f = files[fileHash];
        if (!f.sharedWith[msg.sender]) return (false, "", "", address(0), 0); // check access
        return (true, f.filename, f.ipfsCid, f.uploader, f.timestamp);
    }

}