var DatariusICO = artifacts.require("DatariusICO.sol");
var DatariusToken = artifacts.require("DatariusToken.sol");
var DatToken = artifacts.require("DatToken.sol");


const increaseTime = function(duration) {
    const id = Date.now()
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [duration],
            id: id,
        }, err1 => {
        if (err1) return reject(err1)
            web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id+1,
        }, (err2, res) => {
            return err2 ? reject(err2) : resolve(res)
            })
        })
    })
}


/* 
====================================================================================================
Dataruis ICO Tests in case when SoftCap achieved
====================================================================================================
*/

contract('DatariusICO in case when softCap achieved', function(accounts) {
    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    };
    var DatariusTokenContract; 
    var DatariusICOContract;
    var DatTokenContract;
    // Outside addresses
    var preSaleOwner = accounts[0];
    var Company = accounts[1];
    var BountyFund = accounts[2];
    var PartnersFund = accounts[3];
    var ReserveFund = accounts[4]; 
    var TeamFund = accounts[5];
    var Manager = accounts[6];
    var Controller_Address1 = accounts[7];
    var Controller_Address2 = accounts[7];
    var Controller_Address3 = accounts[7];
    var RefundManager = accounts[8];
    var Oracle = accounts[9];
    // Investors addresses
    var investorEth = accounts[10];
    var investorOtherCrypto = accounts[11];
    var investorSwap = accounts[12];
    var notInvestor = accounts[13];

/* 
====================================================================================================
Start of testing
====================================================================================================
*/    
    it('should start ICO', function() {
        return DatariusICO.deployed()
        .then(function(instance) {
            var Contract = instance;
            DatariusICOContract = Contract;
            return DatariusICOContract.startIco({
                from: Manager
            })
        })
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'ICO was not started');
        })
    });


    it('should sell tokens for ETH when ico status is started', async function() {
        var token = await DatariusICOContract.DTRC.call();
        DatariusTokenContract = DatariusToken.at(token);
        var balanceBefore = await DatariusTokenContract.balanceOf.call(investorEth);
        var etherAmount = randomInteger(1000000, 100000000000); 
        await web3.eth.sendTransaction(
            {
                from: investorEth, 
                to: DatariusICOContract.address, 
                value: etherAmount,
                gas: 200000
            }
        );
        var balanceAfter = await DatariusTokenContract.balanceOf.call(investorEth);
        assert(balanceAfter.toNumber() > balanceBefore.toNumber(), 'tokens was not sold correctly');
    });


    it('should sell tokens for other cryptocurriencies when ico status is started', async function() {
        var balanceBefore = await DatariusTokenContract.balanceOf.call(investorOtherCrypto);
        var tokensAmount = randomInteger(100000, 10000000); 
        var tx_Hash = 'someHash';
        await DatariusICOContract.buyForInvestor(
                investorOtherCrypto,
                tokensAmount,
                tx_Hash,
                {
                    from: Controller_Address1
                }
        );
        var balanceAfter = await DatariusTokenContract.balanceOf.call(investorOtherCrypto);
        assert(balanceAfter.toNumber() > balanceBefore.toNumber(), 'tokens was not sold correctly');    
    });



    it('should set rate to 1000000', function() {
        var setRate = 1000000;
        return DatariusICO.deployed()
        .then(function(instance) {
                var Contract = instance;
                DatariusICOContract = Contract;
                return Contract.setRate(setRate, {
                from: Oracle
                });
        })
    });

    it('should exceed SoftCap', function() {
        var etherAmount = web3.toWei(1, 'ether');
        return DatariusICOContract.sendTransaction({
                from: investorEth,
                value: etherAmount
            });        
    });

    it('should not allow to exceed HardCap', function() {
        var etherAmount = web3.toWei(52, 'ether');
        return DatariusICOContract.sendTransaction({
                from: investorEth,
                value: etherAmount
        })
        .then(function() {
            assert(false, 'HardCap was exceeded');
        })
        .catch(function(err) {
            if (err.message !== 'VM Exception while processing transaction: revert') {
                assert(false, 'HardCap was exceeded');
            }
        })        
    });

    it('should finish ICO', function() {
        return DatariusICOContract.finishIco({
        from: Manager
        })
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'ICO was not finished');
        })
    });


    it('should allow to transfer tokens when ico finished and SoftCap was achieved', function() {
        return DatariusTokenContract.transfer(
                notInvestor,
                1000, 
                {
                    from: investorEth
                }
        )
        .then(function() {
            return DatariusTokenContract.balanceOf.call(notInvestor);
        })
        .then(function(balance) {
            assert.equal(balance.toNumber(), 1000, 'tokens was  transfered')
        })
    });

    it('should not allow to refund ether when ico finished and SoftCap was achieved', function() {
        return DatariusICOContract.refundEther(
            {
                from: investorEth
            }
        )
        .then(function () {
            assert(false, 'investments was refunded');    
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })  
    });


    it('should not allow to burn tokens of other crypto investors when ico finished and SoftCap was achieved', function() {
        var logString = 'someString';
        return DatariusICOContract.refundOtherCrypto(
            investorOtherCrypto,
            logString,
            {
                from: RefundManager
            }
        )
        .then(function () {
            assert(false, 'tokens was burned');    
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })  
    });


    it('should allow to withdraw ether when softCap was achieved', function() {
        return DatariusICOContract.withdrawEther(
        {
            from: Manager
        })
        .then(function() {
            assert.equal(
                web3.eth.getBalance(DatariusICOContract.address).toNumber(),
                0, 
                'ether was not withdrawed'
            );
        })
    });


});
