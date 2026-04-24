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
    const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
    
  beforeEach(async () => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
  })

  describe('Deployment', () => {

    beforeEach(async () => {
    const releaseDate = Date.now().toString().slice(0, 10)
    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy('Dapp Punks', 'DP', cost, maxSupply, releaseDate, BASE_URI)
    })
    
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
      const releaseDate = Date.now().toString().slice(0, 10)
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
        const releaseDate = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy('Dapp Punks', 'DP', cost, maxSupply, releaseDate, BASE_URI)
        
        transaction = await nft.connect(minter).mint(1, {value: cost })
        result = await transaction.wait()
      })

      it('Returns Address of Minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('Returns Total Number of tokens the Minter Owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('Returns IPFS URI', async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('Updates the Total Supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('Updates the Contract Ether Balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(cost)
      })
      it('Emits Mint Event', async () => {
        await expect(transaction).to.emit(nft, 'Mint').withArgs(1, minter.address)
      })

    })

    describe('Failure', () => {
      beforeEach(async () => {
        const releaseDate = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy('Dapp Punks', 'DP', cost, maxSupply, releaseDate, BASE_URI)
      })
      it('Rejects Insufficient Payment', async () => {
        await expect(nft.connect(minter).mint(1, {value: ether (1) })).to.be.reverted
      })

      it('Rejects Minting Before Allowed Time', async () => {
        const releaseDate = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        await expect(nft.connect(minter).mint(1, {value: cost })).to.be.reverted
      })

      it('Requires At Least One NFT to be Minted', async () => {
        await expect(nft.connect(minter).mint(0, {value: cost })).to.be.reverted
      })

      it('Rejects NFT Overminting if Above Max Supply', async () => {
        await expect(nft.connect(minter).mint(100, {value: cost })).to.be.reverted
      })
      it('Dose not Return URIs for Invalid Tokens', async () => {
        await expect(nft.tokenURI('99')).to.be.reverted
      })

    })
  })

  describe('Displaying NFTs', () => {
    

    it('Returns all the NFTs for a Given Owner', async () => {
        let amount, transaction, result
        const releaseDate = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy('Dapp Punks', 'DP', cost, maxSupply, releaseDate, BASE_URI)
        
        transaction = await nft.connect(minter).mint(3, {value: ether(30) })
        result = await transaction.wait()
        let tokenIds = await nft.walletOfOwner(minter.address)
        expect(tokenIds.length).to.equal(3)
        expect(tokenIds[0].toString()).to.equal('1')
        expect(tokenIds[1].toString()).to.equal('2')
        expect(tokenIds[2].toString()).to.equal('3')
      })
  })
})
