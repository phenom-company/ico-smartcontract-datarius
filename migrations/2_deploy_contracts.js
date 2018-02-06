var DatToken = artifacts.require("DatToken.sol");
var DatariusICO = artifacts.require("DatariusICO.sol");
var DatariusToken = artifacts.require("DatariusToken.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(
        DatToken,
        accounts[0]
    )
    .then(function() {
        return DatToken.deployed()
    })
    .then(function(DatTokenContract) {
        return deployer.deploy(
    		DatariusICO,
    		DatTokenContract.address, // Pre-Sale token
    		accounts[1], // Company
    		accounts[2], // BountyFund
    		accounts[3], // PartnersFund
    		accounts[4], // ReserveFund
    		accounts[5], // TeamFund
    		accounts[6], // Manager,
            accounts[6], // ReserveManager,
			accounts[7], // Controller_Address1,
			accounts[7], // Controller_Address2,
			accounts[7], // Controller_Address3,
			accounts[8],  // RefundManager,
			accounts[9] // Oracle
    	)
        
    });
    

};

