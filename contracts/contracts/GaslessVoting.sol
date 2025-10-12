// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GaslessVoting {
    struct Poll {
        string question;
        string[] options;
        mapping(uint256 => uint256) votes;
        address creator;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
    }

    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256[]) public userPolls;
    
    uint256 public pollCount;
    address public owner;

    event PollCreated(uint256 pollId, string question, address creator, uint256 endTime);
    event Voted(uint256 pollId, address voter, uint256 option);
    event PollEnded(uint256 pollId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier validPoll(uint256 _pollId) {
        require(_pollId < pollCount, "Invalid poll ID");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPoll(
        string memory _question,
        string[] memory _options,
        uint256 _durationInMinutes
    ) external returns (uint256) {
        require(bytes(_question).length > 0, "Question required");
        require(_options.length >= 2, "At least two options required");
        require(_durationInMinutes > 0, "Duration must be positive");

        uint256 pollId = pollCount;
        Poll storage newPoll = polls[pollId];
        
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.creator = msg.sender;
        newPoll.endTime = block.timestamp + (_durationInMinutes * 1 minutes);
        newPoll.isActive = true;
        newPoll.totalVotes = 0;

        userPolls[msg.sender].push(pollId);
        pollCount++;

        emit PollCreated(pollId, _question, msg.sender, newPoll.endTime);
        return pollId;
    }

    function vote(uint256 _pollId, uint256 _option) external validPoll(_pollId) {
        Poll storage poll = polls[_pollId];
        
        require(poll.isActive, "Poll is not active");
        require(block.timestamp <= poll.endTime, "Poll has ended");
        require(_option < poll.options.length, "Invalid option");
        require(!hasVoted[_pollId][msg.sender], "Already voted");

        poll.votes[_option]++;
        poll.totalVotes++;
        hasVoted[_pollId][msg.sender] = true;

        emit Voted(_pollId, msg.sender, _option);

        // Auto-end poll if duration passed (safety check)
        if (block.timestamp > poll.endTime) {
            poll.isActive = false;
            emit PollEnded(_pollId);
        }
    }

    function getPoll(uint256 _pollId) 
        external 
        view 
        validPoll(_pollId) 
        returns (
            string memory question,
            string[] memory options,
            address creator,
            uint256 endTime,
            bool isActive,
            uint256 totalVotes
        ) 
    {
        Poll storage poll = polls[_pollId];
        return (
            poll.question,
            poll.options,
            poll.creator,
            poll.endTime,
            poll.isActive,
            poll.totalVotes
        );
    }

    function getVotes(uint256 _pollId, uint256 _option) 
        external 
        view 
        validPoll(_pollId) 
        returns (uint256) 
    {
        require(_option < polls[_pollId].options.length, "Invalid option");
        return polls[_pollId].votes[_option];
    }

    function getPollResults(uint256 _pollId) 
        external 
        view 
        validPoll(_pollId) 
        returns (uint256[] memory) 
    {
        Poll storage poll = polls[_pollId];
        uint256[] memory results = new uint256[](poll.options.length);
        
        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = poll.votes[i];
        }
        
        return results;
    }

    function getUserPolls(address _user) external view returns (uint256[] memory) {
        return userPolls[_user];
    }

    function endPoll(uint256 _pollId) external validPoll(_pollId) {
        Poll storage poll = polls[_pollId];
        require(msg.sender == poll.creator || msg.sender == owner, "Not authorized");
        require(poll.isActive, "Poll already ended");
        
        poll.isActive = false;
        emit PollEnded(_pollId);
    }

    function extendPoll(uint256 _pollId, uint256 _additionalMinutes) 
        external 
        validPoll(_pollId) 
    {
        Poll storage poll = polls[_pollId];
        require(msg.sender == poll.creator || msg.sender == owner, "Not authorized");
        require(poll.isActive, "Poll not active");
        
        poll.endTime += (_additionalMinutes * 1 minutes);
    }
}