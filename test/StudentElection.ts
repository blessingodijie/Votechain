import { expect } from "chai";
import hre from "hardhat";
import { ethers, ContractFactory } from "ethers";

describe("StudentElection Contract", () => {

    let election: any;
    let admin: any;
    let voter1: any;
    let voter2: any;
    let candidate1: any;
    let candidate2: any;

    beforeEach(async () => {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        admin = await provider.getSigner(0);
        voter1 = await provider.getSigner(1);
        voter2 = await provider.getSigner(2);
        candidate1 = await provider.getSigner(3);
        candidate2 = await provider.getSigner(4);

        const artifact = await hre.artifacts.readArtifact("StudentElection");
        const factory = new ContractFactory(artifact.abi, artifact.bytecode, admin);
        election = await factory.deploy();
    })

    describe("createElection", () => {

        it("should allow admin to create an election", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            const fetchedElection = await election.getElection(0);
            expect(fetchedElection.title).to.equal("Student Union Elections 2026");
            expect(fetchedElection.isActive).to.equal(true);
        })

        it("should prevent non-admin from creating an election", async () => {
            try {
                await election.connect(voter1).createElection(
                    "Student Union Elections 2026",
                    86400
                );
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Not authorized");
            }
        })

    })

    describe("addCandidate", () => {

        it("should allow admin to add a candidate", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).addCandidate(
                0,
                "Blessing Odijie",
                "President",
                "Computer Science",
                candidate1.address
            );
            const fetchedCandidates = await election.getCandidates(0);
            expect(fetchedCandidates[0].name).to.equal("Blessing Odijie");
            expect(fetchedCandidates[0].position).to.equal("President");
            expect(fetchedCandidates[0].department).to.equal("Computer Science");
        })

        it("should prevent non-admin from adding a candidate", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            try {
                await election.connect(voter1).addCandidate(
                    0,
                    "Blessing Odijie",
                    "President",
                    "Computer Science",
                    candidate1.address
                );
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Not authorized");
            }
        })

    })

    describe("vote", () => {

        it("should allow a valid vote", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).addCandidate(
                0,
                "Blessing Odijie",
                "President",
                "Computer Science",
                candidate1.address
            );
            await election.connect(voter1).vote(0, 0);
            const fetchedCandidates = await election.getCandidates(0);
            expect(fetchedCandidates[0].voteCount).to.equal(1n);
        })

        it("should prevent a wallet from voting twice for same position", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).addCandidate(
                0,
                "Blessing Odijie",
                "President",
                "Computer Science",
                candidate1.address
            );
            await election.connect(voter1).vote(0, 0);
            try {
                await election.connect(voter1).vote(0, 0);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("You have already voted for this position");
            }
        })

        it("should prevent voting on non-existent candidate", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            try {
                await election.connect(voter1).vote(0, 99);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Candidate does not exist");
            }
        })

        it("should prevent voting after election has ended", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).addCandidate(
                0,
                "Blessing Odijie",
                "President",
                "Computer Science",
                candidate1.address
            );
            await election.connect(admin).endElection(0);
            try {
                await election.connect(voter1).vote(0, 0);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Election is not active");
            }
        })

        it("should allow voting for different positions", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).addCandidate(
                0,
                "Blessing Odijie",
                "President",
                "Computer Science",
                candidate1.address
            );
            await election.connect(admin).addCandidate(
                0,
                "Sarah Oboh",
                "Secretary",
                "Accounting",
                candidate2.address
            );
            await election.connect(voter1).vote(0, 0);
            await election.connect(voter1).vote(0, 1);
            const fetchedCandidates = await election.getCandidates(0);
            expect(fetchedCandidates[0].voteCount).to.equal(1n);
            expect(fetchedCandidates[1].voteCount).to.equal(1n);
        })

    })

    describe("endElection", () => {

        it("should allow admin to end an election", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).endElection(0);
            const fetchedElection = await election.getElection(0);
            expect(fetchedElection.isActive).to.equal(false);
        })

        it("should prevent non-admin from ending an election", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            try {
                await election.connect(voter1).endElection(0);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Not authorized");
            }
        })

    })

    describe("getCandidates", () => {

        it("should return correct candidates for an election", async () => {
            await election.connect(admin).createElection(
                "Student Union Elections 2026",
                86400
            );
            await election.connect(admin).addCandidate(
                0,
                "Blessing Odijie",
                "President",
                "Computer Science",
                candidate1.address
            );
            await election.connect(admin).addCandidate(
                0,
                "Sarah Oboh",
                "Secretary",
                "Accounting",
                candidate2.address
            );
            const fetchedCandidates = await election.getCandidates(0);
            expect(fetchedCandidates.length).to.equal(2);
            expect(fetchedCandidates[0].name).to.equal("Blessing Odijie");
            expect(fetchedCandidates[1].name).to.equal("Sarah Oboh");
        })

    })

    describe("getElection", () => {

        it("should prevent fetching non-existent election", async () => {
            try {
                await election.getElection(99);
                expect.fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.message).to.include("Election does not exist");
            }
        })

    })

})