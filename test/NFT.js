const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Token', () => {
    let nft , accounts, deployer, minter
    const name = 'Dapp Punks'
    const symbol = 'DP'
    const cost =ether(10)
    const maxSupply = 25
    const releaseDate = '1893499200'
    const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
    

  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy('Dapp Punks', 'DP', cost, maxSupply, releaseDate, BASE_URI)

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]

  })

  describe('Deployment', () => {
   

    it('Has Correct Name', async () => {
      expect(await nft.name()).to.equal(name)
    })

    it('Has Correct Symbol', async () => {
      expect(await nft.name()).to.equal(name)
    })

    it('It Returns Correct Cost to Mint', async () => {
      expect(await nft.cost()).to.equal(cost)
    })

    it('It Displays Correct Max Supply', async () => {
      expect(await nft.maxSupply()).to.equal(maxSupply)
    })

    it('It Returns Correct Minting Time', async () => {
      expect(await nft.allowMintingOn()).to.equal(releaseDate)
    })
    
    it('It Has Correct Base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('Returns Correct Owner of Contract', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })

  })


  describe('Minting NFTs', () => {
    let amount, transaction, result

    describe('Success', () => {

      beforeEach(async () => {
        amount = tokens(100)
        transaction = await token.connect(deployer).transfer(receiver.address, amount)
        result = await transaction.wait()
      })

      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
        expect(await token.balanceOf(receiver.address)).to.equal(amount)
      })

    })

    describe('Failure', () => {
      it('rejects insufficient balances', async () => {
        const invalidAmount = tokens(100000000)
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
      })

      it('rejects invalid recipent', async () => {
        const amount = tokens(100)
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
      })

    })

  })
})
