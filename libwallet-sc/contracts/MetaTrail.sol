//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
contract MetaTrail is Context, ERC165, IERC721, IERC721Metadata, Ownable {
    using Address for address;
    using Strings for uint256;

    constructor() {
        _name = "MetaTrail";
        _symbol = "mtrl";

        _isMintingActive = true;
    }

    struct CacheContainer {
        string title;
        uint128 tokenId;
        address author;
        bool unlocked;
        uint32 quantity;
    }

    //TODO FAME-SPOT-TREASURE (SPOT INITIALIZED  WITH FAME THAT IS DISTRIBUTABLE)

    //POSSIBLE MESSAGE CODES AND MEANINGS
    string[] _requireCodes = 
    [
        "[RQ001]", "Minting is currently not active",
        "[RQ002]", "You cannot mint empty messages",
        "[RQ003]", "You don't have enough fame! (at least 1 required for this action)",
        "[RQ004]", "You are trying to unlock a message from a spot that has no messages!",
        "[RQ005]", "this message was never unlocked with fame",
        "[RQ006]", "you do not have enough fame to vote",        
        "[RQ007]", "the message you are trying to vote on does not exist in this spot",
        "[RQ008]", "not enough fame",
        "[RQ009]", "you do not have any cachecoins for this spot!",
        "[RQ010]", "a cache name cannot exceed 15 characters!"
        "[RQ011]", "this cache is full, you cannot write more messages!"
    ];  

    // Mapping from SpotId to TokenId
    mapping(uint64 => uint256) private _claimedSpots;

    // Mapping owner to cacheTokenId
    mapping(uint128 => address) private _cacheCreators;

    mapping(uint128 => string[]) private _cacheEntries;

    // Mapping of owners to famecoints
    mapping(address => uint16) private _fameWallet;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from token ID to approved address
    mapping(address => mapping(uint128 => bool)) private _ownerUnlockedCaches;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) internal _operatorApprovals;

    string private _name;

    string private _symbol;

    bool private _isMintingActive = true;

    //fileHash to txHash
    //spotId to message array
    mapping(uint64 => string[]) _spotCaches; //index is cacheIndex, cacheIndex + spotId is cacheId

    //messagetokenid to vote amt
    mapping(uint128 => uint32) _voteWallet;

    //future plans
    uint32 _maxCacheTokenPerSpot = 1000;
    uint32 _maxEntriesPerCache = 10000000;

    address[] internal _owners;
    string _baseURL;

    event MintedEntry(address sender, uint64 spotId, uint256 cacheTokenId,bytes32 entryHash, uint16 currentFameBalance);
    event MintedCache(address sender, uint64 spotId, uint256 cacheTokenId, uint16 currentFameBalance);
    event SpotClaimed(address sender, uint256 tokenId, uint64 spotId, uint16 currentFameBalance);
    event UnlockedCache(address sender, uint256 cacheTokenId, uint64 spotId, uint16 currentFameBalance);

    function setBaseURI(string memory uri) public onlyOwner {
        _baseURL = uri;
    }

    function getIsMintingActive() public view returns (bool) {
        return _isMintingActive;
    }

    function setIsMintingActive() public onlyOwner {
        _isMintingActive = true;
    }

    function setIsMintingInactive() public onlyOwner {
        _isMintingActive = false;
    }

    function getPossibleRevertMessages() public view returns (string[] memory)
    {
    return _requireCodes;
    }

    function mintEntry(
        string memory uniCodeMessage,
        uint32 longitude,
        uint32 latitude
    ) public {
        require(_isMintingActive,  "[RQ001] Minting is currently not active");
        require(bytes(uniCodeMessage).length > 0,"[RQ002] You cannot mint empty messages");

        uint64 spotId = _getSpotIdForCoordinates(longitude, latitude);

        if (!_existsSpot(spotId)) {
            uint256 tokenId = _owners.length;
            _mint(_msgSender(), tokenId);
            
            _addFame(_msgSender(), 200);
            _claimedSpots[spotId] = tokenId;
            emit SpotClaimed(_msgSender(), tokenId, spotId,_fameWallet[_msgSender()]);
        }

        _mintEntryOnSpot(spotId, uniCodeMessage);
    }

    function getCachesForSpot(uint32 longitude, uint32 latitude)
        public
        view
        returns (CacheContainer[] memory)
    {
        uint64 spotId = _getSpotIdForCoordinates(longitude, latitude);
        string[] memory cachesForSpot = _spotCaches[spotId];
        CacheContainer[] memory caches = new CacheContainer[](
            cachesForSpot.length
        );

        for (uint256 cacheIndex = 0; cacheIndex < cachesForSpot.length; cacheIndex++) {

            uint128 cacheTokenId = _getCacheTokenIdFromSpotIdAndCacheIndex(spotId,cacheIndex);

            caches[cacheIndex] = CacheContainer(
                cachesForSpot[cacheIndex],
                cacheTokenId,
                _cacheCreators[cacheTokenId],
                _ownerUnlockedCaches[_msgSender()][cacheTokenId],
                uint32(_cacheEntries[cacheTokenId].length)
            );
        }

        return caches;
    }

    //this is important for fame distribution, glory leads to glamour
    function unlockCache(uint128 cacheTokenId)
        public
    {
        uint64 spotId = _getSpotIdFromCacheTokenId(cacheTokenId);
        require(_fameWallet[_msgSender()] > 2,      "[RQ003] You don't have enough fame! (at least 3 required for this action)." );
        require(_existsCache(cacheTokenId),   "[RQ004] You are trying to unlock a message from a spot that has no messages!");
        
        _fameWallet[_msgSender()] = _fameWallet[_msgSender()] - 3;

        _addFame(_cacheCreators[cacheTokenId], 2); // an upvote earns you 2 fame
        _addFame(_owners[_claimedSpots[spotId]], 1); // an upvote earns the spot owner 1 fame


        _ownerUnlockedCaches[_msgSender()][cacheTokenId] = true;
        
        emit UnlockedCache(_msgSender(),cacheTokenId,spotId,_fameWallet[_msgSender()]);

    }

    function getUnlockedCacheEntries(uint128 cacheTokenId) public view returns (string[] memory)
    {
        require(_ownerUnlockedCaches[_msgSender()][cacheTokenId] == true, '[RQ005] this message was never unlocked with fame');
        
        return _cacheEntries[cacheTokenId];
    }

    function _existsCache(uint128 cacheTokenId) internal view returns (bool)
    {
       return _cacheCreators[cacheTokenId] != address(0);
    }

    function upvoteCache(uint128 cacheTokenId) public {
        uint64 spotId = _getSpotIdFromCacheTokenId(cacheTokenId);
        require(_fameWallet[_msgSender()] > 0,'[RQ006] you do not have enough fame to vote');
        require(_existsCache(cacheTokenId) 
                ,'[RQ007] the message you are trying to vote on does not exist in this spot');

        _fameWallet[_msgSender()]--;
        _voteWallet[cacheTokenId]++;

        _addFame(
            _cacheCreators[cacheTokenId],
            ((uint16)(_voteWallet[cacheTokenId] / 10)) + 1
        ); // an upvote earns you 1 famecoins and the amount of upvotes divided by ten
        _addFame(_owners[_claimedSpots[spotId]], 1); // an upvote earns the spot owner 1 famecoin
    }



    function getFameBalance() public view returns (uint16) {
        return _fameWallet[_msgSender()];
    }


    function _getSpotIdForCoordinates(uint32 longitude, uint32 latitude)
        internal
        pure
        returns (uint64)
    {
        //app has to transmit the last 6 characters after decimal point of coordinate
        uint64 longAngle = uint64(longitude / 1000000); //starting from a point on the poles, draw lines in this angle along the longitude of earth
        uint64 longDecimal100sqm = uint64((longitude - (longAngle * 1000000)) / 100);
        //longDecimal100sqm needs a transformation --> 10/90 * angel * 100 === 100m for a millionth decimal digit //adapt to changing spot sizes when nearing the poles (imagine a grid on the planet)

        uint64 longSpot = longAngle * 1000000 + longDecimal100sqm * 100;
        uint64 latAngle = uint64(latitude / 1000000);
        uint64 latDecimal100sqm = uint64((latitude - latAngle * 1000000) / 100); //size of a grid element
        uint64 latSpot = latAngle * 1000000 + latDecimal100sqm * 100;
        uint64 spotId = longSpot * 1000000000 + latSpot; //longSpot is shifted left and latSpot is added
        return spotId;
    }

    function _existsSpot(uint64 spotId) internal view returns (bool) {
        return _claimedSpots[spotId] != 0;
    }



    function _substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }


    function _getCacheIndexFromCacheTokenId(uint128 cacheTokenId)
        internal
        view
        returns (uint32)
    {
        return
            uint32(cacheTokenId - uint128(cacheTokenId / _maxCacheTokenPerSpot) * _maxCacheTokenPerSpot);
    }

    function _payCacheCreationCost(uint64 spotId) internal {
        uint16 cost =  uint16(20 + uint16(_spotCaches[spotId].length / 10));
        require(_fameWallet[_msgSender()] >= cost,'[RQ008] not enough fame');

        _fameWallet[_msgSender()] -= cost; // means, 2 messages in this spot cost nothing extra, 20 will cost 2 extra, 100 will cost 10 extra

    }

    function _getSpotIdFromCacheTokenId(uint128 cacheTokenId)
        internal
        view
        returns (uint64)
    {
        return (uint64)(cacheTokenId / _maxCacheTokenPerSpot);
    }

    function _addFame(address receiver, uint16 amt) internal {
        _fameWallet[receiver] = _fameWallet[receiver] + amt;
    }

    function _getSenderCacheTokenIdIfExists(uint64 spotId) internal view  returns (uint128)
    {
        for(uint i = 0; i < _spotCaches[spotId].length; i++)
        {
        uint128 cacheTokenId = _getCacheTokenIdFromSpotIdAndCacheIndex(spotId,i);
        if(_cacheCreators[cacheTokenId] == _msgSender()) return cacheTokenId;
        }
        return 0;
    }

    function _mintEntryOnSpot(
        uint64 spotId,
        string memory message
    ) internal {
      
      uint128 cacheTokenId = _getSenderCacheTokenIdIfExists(spotId);

        if(cacheTokenId == 0)
        {
            cacheTokenId = _getCacheTokenIdFromSpotIdAndCacheIndex(spotId,_spotCaches[spotId].length);
            require(bytes(message).length <= 30, '[RQ010] a cache name cannot exceed 15 characters!');

            _spotCaches[spotId].push(message); //this sets cacheid
            _voteWallet[cacheTokenId] = 0;
            _cacheCreators[cacheTokenId] = _msgSender();
            _ownerUnlockedCaches[_msgSender()][cacheTokenId] = true;
            _payCacheCreationCost(spotId);
            emit MintedCache(_msgSender(), spotId, cacheTokenId,_fameWallet[_msgSender()]);
        }
        else
        {
            require(_cacheEntries[cacheTokenId].length < _maxEntriesPerCache, '[RQ011] this cache is full, you cannot write more messages!');
            _cacheEntries[cacheTokenId].push(message);
            emit MintedEntry(_msgSender(), spotId, cacheTokenId,keccak256(bytes(message)),_fameWallet[_msgSender()]);
        }
       
        
    }
    
    function _getCacheTokenIdFromSpotIdAndCacheIndex(uint64 spotId, uint256 cacheIndex)
        internal
        view
        returns (uint128)
    {
        return uint128(
            (cacheIndex) + uint128(spotId) * _maxCacheTokenPerSpot
        );
    }


    //ERC721 #################################

    function totalSupply() public view returns (uint256) {
        return _owners.length;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );

        uint256 amt = 0;
        for (uint256 i = 0; i < _owners.length; i++) {
            if (_owners[i] == owner) {
                amt++;
            }
        }
        return amt;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = _owners[tokenId];
        require(
            owner != address(0),
            "ERC721: owner query for nonexistent token"
        );
        return owner;
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return _baseURL;
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = MetaTrail.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        require(
            _exists(tokenId),
            "ERC721: approved query for nonexistent token"
        );

        return _tokenApprovals[tokenId];
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _safeTransfer(from, to, tokenId, _data);
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `_data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        _transfer(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners.length < tokenId; //owner length is the amt of existing tokens, including burned tokens
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = MetaTrail.ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    /**
     * @dev Safely mints `tokenId` and transfers it to `to`.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal virtual {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual {
        _mint(to, tokenId);
        require(
            _checkOnERC721Received(address(0), to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        _beforeTokenTransfer(address(0), to, tokenId);
        _owners.push(to);

        emit Transfer(address(0), to, tokenId);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal virtual {
        address owner = MetaTrail.ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        _owners[tokenId] = address(0);

        emit Transfer(owner, address(0), tokenId);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        require(
            MetaTrail.ownerOf(tokenId) == from,
            "ERC721: transfer of token that is not own"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits a {Approval} event.
     */
    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(MetaTrail.ownerOf(tokenId), to, tokenId);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits a {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal virtual {
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721Received(
                    _msgSender(),
                    from,
                    tokenId,
                    _data
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert(
                        "ERC721: transfer to non ERC721Receiver implementer"
                    );
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     * - When `to` is zero, ``from``'s `tokenId` will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}
}
