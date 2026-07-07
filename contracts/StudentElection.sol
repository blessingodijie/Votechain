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
        string name;
        string position;
        string department;
        uint256 voteCount;
        address walletAddress;
    }

    Election[] public elections;
    mapping(uint256 => Candidate[]) public electionCandidates;
    address public admin;
    mapping(uint256 => mapping(string => mapping(address => bool))) public alreadyVoted;

    event VoteCast(uint256 electionId, string position, address voter, uint256 candidateId);
    event CandidateAdded(uint256 electionId, string name, string position);
    event ElectionCreated(uint256 electionId, string title);

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
        emit ElectionCreated(electionId, title);
    }

    function addCandidate(
        uint256 electionId,
        string memory name,
        string memory position,
        string memory department,
        address walletAddress
    ) external onlyAdmin {
        require(electionId < elections.length, "Election does not exist");
        electionCandidates[electionId].push(Candidate({
            name: name,
            position: position,
            department: department,
            voteCount: 0,
            walletAddress: walletAddress
        }));
        emit CandidateAdded(electionId, name, position);
    }

    function vote(uint256 electionId, uint256 candidateId) external {
        require(electionId < elections.length, "Election does not exist");
        require(candidateId < electionCandidates[electionId].length, "Candidate does not exist");

        Election storage election = elections[electionId];
        Candidate storage candidate = electionCandidates[electionId][candidateId];

        require(election.isActive, "Election is not active");
        require(block.timestamp < election.endTime, "Voting has ended");
        require(
            !alreadyVoted[electionId][candidate.position][msg.sender],
            "You have already voted for this position"
        );

        candidate.voteCount += 1;
        alreadyVoted[electionId][candidate.position][msg.sender] = true;
        emit VoteCast(electionId, candidate.position, msg.sender, candidateId);
    }

    function getElection(uint256 electionId) external view returns(Election memory) {
        require(electionId < elections.length, "Election does not exist");
        return elections[electionId];
    }

    function getCandidates(uint256 electionId) external view returns(Candidate[] memory) {
        require(electionId < elections.length, "Election does not exist");
        return electionCandidates[electionId];
    }

    function endElection(uint256 electionId) external onlyAdmin {
        require(electionId < elections.length, "Election does not exist");
        elections[electionId].isActive = false;
    }

    function getElectionCount() external view returns(uint256) {
        return elections.length;
    }

    function getCandidateCount(uint256 electionId) external view returns(uint256) {
        require(electionId < elections.length, "Election does not exist");
        return electionCandidates[electionId].length;
    }
}