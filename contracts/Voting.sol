// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Voting {

    struct Proposal {
        uint256 id;
        string name;
        string description;
        string[] options;
        uint256[] voteCounts;
        uint256 endTime;
        bool isActive;
        address creator;
    }

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    address public admin;

    event VoteCast(uint256 proposalId, address voter, uint256 optionIndex);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    function createProposal(
        string memory name,
        string memory description,
        string[] memory options,
        uint256 duration
    ) external onlyAdmin {
        uint256 proposalId = proposals.length;
        uint256[] memory initialVotes = new uint256[](options.length);

        proposals.push(Proposal({
            id: proposalId,
            name: name,
            description: description,
            options: options,
            voteCounts: initialVotes,
            endTime: block.timestamp + duration,
            isActive: true,
            creator: msg.sender
        }));
    }

    function vote(uint256 proposalId, uint256 optionIndex) external {
        require(proposalId < proposals.length, "Proposal does not exist");
        require(block.timestamp < proposals[proposalId].endTime && proposals[proposalId].isActive, "Voting closed");
        require(!hasVoted[proposalId][msg.sender], "Cannot vote more than once");
        require(optionIndex < proposals[proposalId].options.length, "The option you selected does not exist, please check available options and try again");

        proposals[proposalId].voteCounts[optionIndex] += 1;
        hasVoted[proposalId][msg.sender] = true;
        emit VoteCast(proposalId, msg.sender, optionIndex);
    }

    function getProposal(uint256 proposalId) external view returns(Proposal memory) {
        require(proposalId < proposals.length, "Proposal does not exist");
        return proposals[proposalId];
    }

    function endProposal(uint256 proposalId) external onlyAdmin {
        require(proposalId < proposals.length, "Proposal does not exist");
        proposals[proposalId].isActive = false;
    }

}