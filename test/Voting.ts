import { expect } from "chai";
import hre from "hardhat";
import { ethers, ContractFactory } from "ethers";

describe("Voting Contract", () => {

    let voting: any;
    let admin: any;
    let voter1: any;
    let voter2: any;

    beforeEach(async () => {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        admin = await provider.getSigner(0);
        voter1 = await provider.getSigner(1);
        voter2 = await provider.getSigner(2);

        const artifact = await hre.artifacts.readArtifact("Voting");
        const factory = new ContractFactory(artifact.abi, artifact.bytecode, admin);
        voting = await factory.deploy();
    })

    describe("createProposal", () => {

        it("should allow admin to create a proposal", async () => {
            await voting.connect(admin).createProposal(
                "Blessing Odijie",
                "Blessing Progressive Party",
                ["Yes", "No"],
                86400
            );
            const proposal = await voting.getProposal(0);
            expect(proposal.name).to.equal("Blessing Odijie");
            expect(proposal.isActive).to.equal(true);
        })

        it("should prevent non-admin from creating a proposal", async () => {
            try {
            await voting.connect(voter1).createProposal(
            "Blessing Odijie",
            "Blessing Progressive Party",
            ["Yes", "No"],
            86400
            );
            expect.fail("Should have thrown an error");
            } catch (error: any) {
            expect(error.reason).to.equal("Not authorized");
          }
        })

        it("should allow a valid vote", async () => {
        await voting.connect(admin).createProposal(
            "Blessing Odijie",
            "Blessing Progressive Party",
            ["Yes", "No"],
            86400
        );

        await voting.connect(voter1).vote(0, 0);

        const proposal = await voting.getProposal(0);
        expect(proposal.voteCounts[0]).to.equal(1n);
        })

it("should prevent a wallet from voting twice", async () => {
await voting.connect(admin).createProposal( "Blessing Odijie", "Blessing Progressive Party", ["Yes", "No"], 86400 );
await voting.connect(voter1).vote(0, 0);

    try {
        await voting.connect(voter1).vote(0, 0);
        expect.fail("Should have thrown an error");
    } catch (error: any) {
    expect(error.message).to.include("Cannot vote more than once");
}
})

it("should prevent voting on non-existent proposal", async () => {
    // no proposal created
    try {
        await voting.connect(voter1).vote(99, 99);
        expect.fail("Should have thrown an error");
    } catch (error: any) {
        expect(error.reason).to.equal("Proposal does not exist");
    }
})

it("should prevent voting with invalid option", async () => {
   await voting.connect(admin).createProposal( "Blessing Odijie", "Blessing Progressive Party", ["Yes", "No"], 86400 );
    try {
        await voting.connect(voter1).vote(0, 5);
        expect.fail("Should have thrown an error");
    } catch (error: any) {
        expect(error.reason).to.equal("The option you selected does not exist, please check available options and try again");
    }
})

it("should prevent voting on an ended proposal", async () => {
    await voting.connect(admin).createProposal(
        "Blessing Odijie",
        "Blessing Progressive Party",
        ["Yes", "No"],
        86400
    );

    // end the proposal first
    await voting.connect(admin).endProposal(0);

    try {
        await voting.connect(voter1).vote(0, 0);
        expect.fail("Should have thrown an error");
    } catch (error: any) {
        expect(error.reason).to.equal("Voting closed");
    }
})

it("should prevent calling proposal that does not exist", async () => {
    try {
        await voting.getProposal(99);
        expect.fail("Should have thrown an error");
    } catch (error: any) {
        expect(error.reason).to.equal("Proposal does not exist");
    }
})

it("should return correct proposal data", async () => {
    // step 1: create proposal
    await voting.connect(admin).createProposal("Blessing Odijie",
        "Blessing Progressive Party",
        ["Yes", "No"],
        86400);
    
    // step 2: fetch it
    const proposal = await voting.getProposal(0);
    
    // step 3: verify fields
    expect(proposal.name).to.equal("Blessing Odijie");
    expect(proposal.description).to.equal("Blessing Progressive Party");
})

it("should allow admin to end proposal", async () => {
    // step 1: create proposal
    await voting.connect(admin).createProposal(
        "Blessing Odijie",
        "Blessing Progressive Party",
        ["Yes", "No"],
        86400
    );
    // step 2: end it
    await voting.connect(admin).endProposal(0);
    // step 3: fetch and verify
    const proposal = await voting.getProposal(0);
    expect(proposal.isActive).to.equal(false);
})

it("should prevent non admin from ending proposal", async () => {
    await voting.connect(admin).createProposal(
        "Blessing Odijie",
        "Blessing Progressive Party",
        ["Yes", "No"],
        86400
    );
    try {
        await voting.connect(voter1).endProposal(0);
        expect.fail("Should have thrown an error");
    } catch (error: any) {
        expect(error.reason).to.equal("Not authorized");
    }
})

it("should prevent ending proposal on invalid proposal ID", async () => {
    await voting.connect(admin).createProposal(
        "Blessing Odijie",
        "Blessing Progressive Party",
        ["Yes", "No"],
        86400);
        try 
        {
            await
            voting.connect(admin).endProposal(99);
            expect.fail("Should have thrown an error");
            } 
            catch (error: any) {
                expect(error.reason).to.equal("Proposal does not exist"); 
            } 
        })
    })

})