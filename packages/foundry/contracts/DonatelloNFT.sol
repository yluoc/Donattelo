//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DonatelloNFT
 * @dev NFT contract for minting AI-generated artwork stored on Walrus
 * @author Donatello AI Platform
 */
contract DonatelloNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from token ID to Walrus blob ID
    mapping(uint256 => string) public tokenToWalrusBlobId;
    
    // Mapping from token ID to metadata blob ID
    mapping(uint256 => string) public tokenToMetadataBlobId;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) public tokenToCreator;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId, 
        address indexed creator, 
        string walrusBlobId,
        string metadataBlobId,
        string uri
    );
    
    constructor() ERC721("Donatello AI Art", "DONAI") Ownable(msg.sender) {
        _nextTokenId = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mint a new NFT with Walrus storage information
     * @param to Address to mint the NFT to
     * @param walrusBlobId The Walrus blob ID containing the image
     * @param metadataBlobId The Walrus blob ID containing the metadata
     * @param uri The token URI (can be Walrus URL or IPFS)
     */
    function mintNFT(
        address to,
        string memory walrusBlobId,
        string memory metadataBlobId,
        string memory uri
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Store Walrus information
        tokenToWalrusBlobId[tokenId] = walrusBlobId;
        tokenToMetadataBlobId[tokenId] = metadataBlobId;
        tokenToCreator[tokenId] = to;
        
        emit NFTMinted(tokenId, to, walrusBlobId, metadataBlobId, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Get Walrus blob ID for a token
     */
    function getWalrusBlobId(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToWalrusBlobId[tokenId];
    }
    
    /**
     * @dev Get metadata blob ID for a token
     */
    function getMetadataBlobId(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToMetadataBlobId[tokenId];
    }
    
    /**
     * @dev Get creator of a token
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToCreator[tokenId];
    }
    
    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    // Required overrides for OpenZeppelin v5
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
