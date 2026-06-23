// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract StudentElection {

    struct Election {
        uint256 id;
        string title;
        uint256 endTime;
        bool isActive;
        address creator;
    }

    struct Candidate {
        uint256 id;
        string name;
        string position;
        uint256 electionId;
        uint256 voteCount;
        address walletAddress;
    }

    Election[] public elections;
    Candidate[] public candidates;
    address public admin;
    mapping(uint256 => mapping(string => mapping(address => bool))) public alreadyVoted;

    event VoteCast(uint256 electionId, string position, address voter, uint256 candidateId);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    function createElection(
        string memory title,
        uint256 duration
    ) external onlyAdmin {
        uint256 electionId = elections.length;
        elections.push(Election({
            id: electionId,
            title: title,
            endTime: block.timestamp + duration,
            isActive: true,
            creator: msg.sender
        }));
    }

    function addCandidate(
        uint256 electionId,
        string memory name,
        string memory position,
        address walletAddress
    ) external onlyAdmin {
        uint256 candidateId = candidates.length;
        candidates.push(Candidate({
            id: candidateId,
            name: name,
            position: position,
            electionId: electionId,
            voteCount: 0,
            walletAddress: walletAddress
        }));
    }

    function vote(uint256 candidateId) external {
        require(candidateId < candidates.length, "Candidate does not exist");
        Candidate storage candidate = candidates[candidateId];
        Election storage election = elections[candidate.electionId];
        require(election.isActive, "Election is not active");
        require(block.timestamp < election.endTime, "Voting has ended");
        require(
            !alreadyVoted[candidate.electionId][candidate.position][msg.sender],
            "You have already voted for this position"
        );
        candidate.voteCount += 1;
        alreadyVoted[candidate.electionId][candidate.position][msg.sender] = true;
        emit VoteCast(candidate.electionId, candidate.position, msg.sender, candidateId);
    }

    function getElection(uint256 electionId) external view returns(Election memory) {
        require(electionId < elections.length, "Election does not exist");
        return elections[electionId];
    }

    function getCandidates(uint256 electionId) external view returns(Candidate[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].electionId == electionId) {
                count++;
            }
        }
        Candidate[] memory result = new Candidate[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].electionId == electionId) {
                result[j] = candidates[i];
                j++;
            }
        }
        return result;
    }

    function endElection(uint256 electionId) external onlyAdmin {
        require(electionId < elections.length, "Election does not exist");
        elections[electionId].isActive = false;
    }
}