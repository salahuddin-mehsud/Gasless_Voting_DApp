import { expect } from "chai";
import { ethers } from "hardhat";

describe("GaslessVoting", function () {
  let gaslessVoting;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const GaslessVoting = await ethers.getContractFactory("GaslessVoting");
    gaslessVoting = await GaslessVoting.deploy();
  });

  describe("Poll Creation", function () {
    it("Should create a poll successfully", async function () {
      const question = "Test Poll?";
      const options = ["Option 1", "Option 2"];
      const duration = 60; // 60 minutes
      
      await expect(gaslessVoting.connect(user1).createPoll(question, options, duration))
        .to.emit(gaslessVoting, "PollCreated")
        .withArgs(0, question, user1.address);
      
      const poll = await gaslessVoting.getPoll(0);
      expect(poll.question).to.equal(question);
      expect(poll.options).to.deep.equal(options);
      expect(poll.creator).to.equal(user1.address);
      expect(poll.isActive).to.be.true;
    });

    it("Should fail with invalid parameters", async function () {
      await expect(gaslessVoting.createPoll("", ["A", "B"], 60)).to.be.revertedWith("Question required");
      await expect(gaslessVoting.createPoll("Test", ["A"], 60)).to.be.revertedWith("At least two options required");
      await expect(gaslessVoting.createPoll("Test", ["A", "B"], 0)).to.be.revertedWith("Duration must be positive");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await gaslessVoting.createPoll("Test Poll", ["Yes", "No"], 60);
    });

    it("Should allow voting", async function () {
      await expect(gaslessVoting.connect(user1).vote(0, 0))
        .to.emit(gaslessVoting, "Voted")
        .withArgs(0, user1.address, 0);
      
      expect(await gaslessVoting.getVotes(0, 0)).to.equal(1);
      expect(await gaslessVoting.hasVoted(0, user1.address)).to.be.true;
    });

    it("Should prevent double voting", async function () {
      await gaslessVoting.connect(user1).vote(0, 0);
      await expect(gaslessVoting.connect(user1).vote(0, 1)).to.be.revertedWith("Already voted");
    });
  });
});