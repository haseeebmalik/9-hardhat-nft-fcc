// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error  RandomIpfsNft__NeedMoreEthSent();
error RandomIpfsNft__TransferFailed();
error RandomIpfsNft__AlreadyInitialized();
contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // when we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
    // using that number, we will get a random NFT
    // Pug, Shiba Inu, St. Bernard
    // Pug super rare
    // Shiba sort of rare
    // St. bernard common

    //users have to pay to mint an NFT
    //the ownwer of the contract can withdraw the ETH

  // Type Declaration
  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }

  // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;


  // VRF Helpers
  mapping(uint256=>address) public s_requestIdToSender; 

  //NFT variables
 uint256 public s_tokenCounter;
 uint256 internal constant MAX_CHANCE_VALUE=100;
 string[] internal s_dogTokenUris;
 uint256 internal i_mintFee;
 bool private s_initialized;

 //Events

 event NftRequested(uint256 indexed requestId,address requester);
 event NftMinted(Breed dogBreed,address minter);
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee

    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT","RIN"){
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId=subscriptionId;
        i_gasLane=gasLane;
        i_callbackGasLimit=callbackGasLimit;
        //  s_dogTokenUris=dogTokenUris;
        _initializeContract(dogTokenUris);
         i_mintFee=mintFee;
    }
     //Accume the subscription is funded sufficently.
    function requestNft() public payable returns(uint256 requestId ){

        if(msg.value<i_mintFee){
            revert RandomIpfsNft__NeedMoreEthSent();
        }
     //Will revert it if subscription is not set and funded.

     requestId=i_vrfCoordinator.requestRandomWords(
       i_gasLane,
        i_subscriptionId,
        REQUEST_CONFIRMATIONS,
        i_callbackGasLimit,
        NUM_WORDS
     );
     s_requestIdToSender[requestId]=msg.sender;

     emit NftRequested(requestId,msg.sender);
    }
 // This function is called by chainlink nodes
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {

        address dogOwner=s_requestIdToSender[requestId];
        uint256 newTokenId=s_tokenCounter;
        // what does this token looks like?
        // It will give us a number in a range (0-MAX_CHANCE_VALUE)
        uint256 moddedRng=randomWords[0] % MAX_CHANCE_VALUE;
        console.log("moddedRng",moddedRng);
        //0-99
         //7 ->PUG
        //88 ->St.Bernard
        //45 -> St.Bernard
        //12 -> shib Inu

       Breed dogBreed= getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner,newTokenId);
        s_tokenCounter=s_tokenCounter+1;
      // This is the function we get from ERC721URIStorage
        _setTokenURI(newTokenId,s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed,dogOwner);

    }
    //here we get onlyOwner modifier from openzappelin's ownable.sol contract
    function withdraw() public onlyOwner {
    //this will give us the amount this contract have
      uint256 amount=address(this).balance;
      (bool success,)=payable(msg.sender).call{value:amount}("");
      if(!success){
        revert RandomIpfsNft__TransferFailed();
      }

    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns(Breed){
        uint256 cumulativeSum=0;
        uint256[3] memory chanceArray=getChanceArray();

        for(uint256 i=0;i<chanceArray.length;i++){
            if(moddedRng>=cumulativeSum && moddedRng<cumulativeSum + chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum+=chanceArray[i];
        }
        // If there is an error and it dont return any thing then revert transaction
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns(uint256[3] memory){
        return [10,30,MAX_CHANCE_VALUE];
    }
    function _initializeContract(string[3] memory dogTokenUris) private {
        if(s_initialized){
            revert RandomIpfsNft__AlreadyInitialized();
        }

       s_dogTokenUris=dogTokenUris;
       s_initialized=true;
    }

    // function tokenURI(uint256) public view override returns(string memory){}

    function getMintFee() public view returns(uint256){
        return i_mintFee;
    }
     function getInitialized() public view returns (bool) {
        return s_initialized;
    }
    function getDogTokenUris(uint256 index) public view returns(string memory){
        return s_dogTokenUris[index];
    }
    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }
}
