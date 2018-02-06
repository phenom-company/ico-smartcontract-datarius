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
Dataruis ICO Tests in case when SoftCap wasn't achieved
====================================================================================================
*/

contract('DatariusICO in case when softCap was not achieved', function(accounts) {
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
    var secondInvestor = accounts[14];

/* 
====================================================================================================
Start of testing
====================================================================================================
*/    


    it('should set rate correctly', function() {
        var random_int = randomInteger(1, 1000);
        return DatariusICO.deployed()
        .then(function(instance) {
                var Contract = instance;
                DatariusICOContract = Contract;
                return DatariusICOContract.setRate(random_int, {
                from: Oracle
                });
        })
        .then(function() {
            return DatariusICOContract.rateEth.call();
        })
        .then(function(rate) {
            assert.equal(rate.toNumber(), random_int, 'rateEth is not correct');
        })
    });


    it('should not sell tokens for ETH when ico status is created', function() {
        var etherAmount = web3.toWei(1, 'ether');
            return DatariusICOContract.sendTransaction({
                from: investorEth,
                value: etherAmount
            })
            .then(function() {
                assert(false, 'token was sold when when ico status is created');
            })
            .catch(function(e) {
                assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
            });
    });

    it('should not sell tokens for other cryptocurrincies when ico status is created', function() {
        var randomInt = randomInteger(10000, 100000);
        var tx_Hash = 'someHash';
        return DatariusICOContract.buyForInvestor(
                investorOtherCrypto,
                randomInt,
                tx_Hash,
                {
                    from: Controller_Address1
                }
        )
        .then(function() {
            assert(false, 'token was sold when when ico status is created');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });

    it('should emit pre-sale tokens',  async function() {
        var randomInt = randomInteger(10000, 1000000);
        var DatTokenContract = await DatToken.deployed();
        await DatTokenContract.mint(
                    investorSwap,
                    randomInt,
                    {
                        from: preSaleOwner
                    }
        )
        var balance = await DatTokenContract.balanceOf.call(investorSwap);
        balance = balance.toNumber();
        assert.equal(balance, randomInt, 'token was not emited');
    });
        
    it ('should swap tokens', async function() {
        var DatTokenContract = await DatToken.deployed();
        var token = await DatariusICOContract.DTRC.call();
        DatariusTokenContract = DatariusToken.at(token);
        await DatariusICOContract.swapTokens(
                investorSwap,
                {
                    from: Manager
                }
        );
        var balanceDTRC = await DatariusTokenContract.balanceOf.call(investorSwap);
        var balanceDat = await DatTokenContract.balanceOf.call(investorSwap);
        balanceDTRC = balanceDTRC.toNumber();
        balanceDat = balanceDat.toNumber();
        assert.equal(Math.floor (10000*balanceDTRC / balanceDat), 458905, 'swap is not correct');

    });

       it ('should not allow to swap twice', function() {
        return DatariusICOContract.swapTokens(
                investorSwap,
                {
                    from: Manager
                }
        )
        .then(function() {
            assert(false, 'tokens was swaped twice');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        })

    });

    it('should start ICO', function() {
        return DatariusICOContract.startIco({
        from: Manager
        })
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'ICO was not started');
        })
    });


    it('should set rate to 1', function() {
        var random_int = 1;
        return DatariusICO.deployed()
        .then(function(instance) {
                var Contract = instance;
                DatariusICOContract = Contract;
                return DatariusICOContract.setRate(random_int, {
                from: Oracle
                });
        })
        .then(function() {
            return DatariusICOContract.rateEth.call();
        })
        .then(function(rate) {
            assert.equal(rate.toNumber(), random_int, 'rateEth is not correct');
        })
    });

    it('should check that token price is 0.01$', async function() {
        etherAmount = 1;
        await web3.eth.sendTransaction(
            {
                from: secondInvestor, 
                to: DatariusICOContract.address, 
                value: etherAmount,
                gas: 200000
            }
        );
        var balance = await DatariusTokenContract.balanceOf.call(secondInvestor);
        assert.equal(balance.toNumber(), 130, 'token price is not 0,01$');
    });
    

    it('should set rate correctly', function() {
        var random_int = randomInteger(1, 1000);
        return DatariusICO.deployed()
        .then(function(instance) {
                var Contract = instance;
                DatariusICOContract = Contract;
                return DatariusICOContract.setRate(random_int, {
                from: Oracle
                });
        })
        .then(function() {
            return DatariusICOContract.rateEth.call();
        })
        .then(function(rate) {
            assert.equal(rate.toNumber(), random_int, 'rateEth is not correct');
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
     

    it('should test bonuses', async function() { 
        var randomInt = randomInteger(10000, 100000);
        await increaseTime(3*60*60);
        var bonus = await DatariusICOContract.getBonus.call(randomInt);
        assert.equal(bonus.toNumber(), Math.floor(randomInt* 30 / 100), 'bonus is not correct');
        await increaseTime(5*60*60);
        bonus = await DatariusICOContract.getBonus.call(randomInt);
        assert.equal(bonus.toNumber(), Math.floor(randomInt* 25 / 100), 'bonus is not correct');  
        await increaseTime(7*60*60);
        bonus = await DatariusICOContract.getBonus.call(randomInt);
        assert.equal(bonus.toNumber(), Math.floor(randomInt* 20 / 100), 'bonus is not correct');  
        await increaseTime(10*60*60);
        bonus = await DatariusICOContract.getBonus.call(randomInt);
        assert.equal(bonus.toNumber(), Math.floor(randomInt* 15 / 100), 'bonus is not correct');
        await increaseTime(10*24*60*60);
        bonus = await DatariusICOContract.getBonus.call(randomInt);
        assert.equal(bonus.toNumber(), Math.floor(randomInt* 10 / 100), 'bonus is not correct');
        await increaseTime(6*24*60*60);
        bonus = await DatariusICOContract.getBonus.call(randomInt);
        assert.equal(bonus.toNumber(), 0, 'bonus is not correct');
        });


    it('should not allow to withdraw ether when ico status is started', function() {
        return DatariusICOContract.withdrawEther(
        {
            from: Manager
        })
        .then(function() {
            assert(false, 'ether was withdrawed');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });



    it('should not allow tokens transfers when ico status is started', function() {
        return DatariusTokenContract.transfer(
                investorOtherCrypto,
                1000, 
                {
                    from: investorEth
                }
        )
        .then(function() {
            assert(false, 'tokens was transfered');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        });
    });

    it('should not allow to refund ether when ico status is started', function() {
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


    it('should not allow to burn tokens of other crypto investors when ico status is started', function() {
        var logString = 'someString';
        return DatariusICOContract.refundOtherCrypto(
            investorOtherCrypto,
            logString,
            {
                from: RefundManager
            }
        )
        .then(function () {
            assert(false, 'investments was refunded');    
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })  
    });



    it('should pause ICO', function() {
        return DatariusICOContract.pauseIco({
        from: Manager
        })
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'ICO was not started');
        })
    });


    it('should not allow to withdraw ether when ico status is paused', function() {
        return DatariusICOContract.withdrawEther(
        {
            from: Manager
        })
        .then(function() {
            assert(false, 'ether was withdrawed');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });



    it('should not allow tokens transfers when ico status is paused', function() {
        return DatariusTokenContract.transfer(
                investorOtherCrypto,
                1000, 
                {
                    from: investorEth
                }
        )
        .then(function() {
            assert(false, 'tokens was transfered');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        });
    });

    it('should not allow to refund ether when ico status is paused', function() {
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


    it('should not allow to burn tokens of other crypto investors when ico status is paused', function() {
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

    it('should not sell tokens for ETH when ico status is paused', function() {
        var etherAmount = web3.toWei(1, 'ether');
            return DatariusICOContract.sendTransaction({
                from: investorEth,
                value: etherAmount
            })
            .then(function() {
                assert(false, 'token was sold when when ico status is paused');
            })
            .catch(function(e) {
                assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
            });
    });

    it('should not sell tokens for other cryptocurrincies when ico status is paused', function() {
        var randomInt = randomInteger(10000, 100000);
        var tx_Hash = 'someHash';
        return DatariusICOContract.buyForInvestor(
                investorOtherCrypto,
                randomInt,
                tx_Hash,
                {
                    from: Controller_Address1
                }
        )
        .then(function() {
            assert(false, 'token was sold when when ico status is paused');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });


    it('should start ICO again', function() {
        return DatariusICOContract.startIco({
        from: Manager
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
    

    it('should not allow to refund ether when ico status is started', function() {
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

    it('should not allow to withdraw ether when ico status is started', function() {
        return DatariusICOContract.withdrawEther(
                {
                    from: Manager
                }
        )
        .then(function() {
            assert(false, 'ether was withdrawded');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        });
    });

    it('should not allow to transfer tokens when ico status is started', function() {
        return DatariusTokenContract.transfer(
                investorOtherCrypto,
                1000, 
                {
                    from: investorEth
                }
        )
        .then(function() {
            assert(false, 'tokens was transfered');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        });
    });


    it('should finish ICO', function() {
        return DatariusICOContract.finishIco({
        from: Manager
        })
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'ICO was not finished');
        })
    });    


    it('should not sell tokens for ETH when ico status is finished', function() {
        var etherAmount = web3.toWei(1, 'ether');
            return DatariusICOContract.sendTransaction({
                from: investorEth,
                value: etherAmount
            })
            .then(function() {
                assert(false, 'token was sold when when ico status is finished');
            })
            .catch(function(e) {
                assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
            });
    }); 

    it('should not sell tokens for other cryptocurrincies when ico status is finished', function() {
        var randomInt = randomInteger(10000, 100000);
        var tx_Hash = 'someHash';
        return DatariusICOContract.buyForInvestor(
                investorOtherCrypto,
                randomInt,
                tx_Hash,
                {
                    from: Controller_Address1
                }
        )
        .then(function() {
            assert(false, 'token was sold when when ico status is finished');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });


    it('should not allow to transfer tokens when SoftCap was not achieved', function() {
        return DatariusTokenContract.transfer(
                investorOtherCrypto,
                1000, 
                {
                    from: investorEth
                }
        )
        .then(function() {
            assert(false, 'tokens was transfered');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        });
    });

    it('should check validity of tokens distribution', async function() {
        var totalSupply = await DatariusTokenContract.totalSupply.call();
        var bountyPart = await DatariusTokenContract.balanceOf.call(BountyFund);
        var partnersPart = await DatariusTokenContract.balanceOf.call(PartnersFund);
        var teamPart = await DatariusTokenContract.balanceOf.call(TeamFund);
        var reservePart = await DatariusTokenContract.balanceOf.call(ReserveFund);
        assert.equal(
            Math.round((bountyPart.toNumber()/ totalSupply.toNumber()) * 100) / 100, 
            0.02, 
            'bounty part is not correct'
        );
        assert.equal(
            Math.round((partnersPart.toNumber()/ totalSupply.toNumber()) * 100) / 100, 
            0.05,
            'partners part is not correct'
        );
        assert.equal(
            Math.round((teamPart.toNumber()/ totalSupply.toNumber()) * 100) / 100, 
            0.05,
            'team part is not correct'
        );
        assert.equal(
            Math.round((reservePart.toNumber()/ totalSupply.toNumber()) * 100) / 100, 
            0.15,
            'reserve part is not correct'
        );  
    });

    it('should not allow to withdraw ether when softCap was not achieved', function() {
        return DatariusICOContract.withdrawEther(
        {
            from: Manager
        })
        .then(function() {
            assert(false, 'ether was withdrawed');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });

    it('should allow to burn tokens of other crypto investors when ico status is finished', async function() {
        var logString = 'someString';
        await DatariusICOContract.refundOtherCrypto(
            investorOtherCrypto,
            logString,
            {
                from: RefundManager
            }
        );
        var balance = await DatariusTokenContract.balanceOf.call(investorOtherCrypto);
        assert.equal(balance.toNumber(), 0 , 'tokens was not burnt');      
    });

    it('should allow to refund ether', async function() {
        await DatariusICOContract.refundEther(
            {
                from: investorEth
            }
        );
        await DatariusICOContract.refundEther(
            {
                from: secondInvestor
            }
        );
        var icoBalance = web3.eth.getBalance(DatariusICOContract.address);
        assert.equal(icoBalance.toNumber(), 0, 'investments was not refunded');
    });

    it('should not allow to refund ether twice ', function() {
        return DatariusICOContract.refundEther(
            {
                from: investorEth
            }
        ) 
        .then(function() {
            assert(false, 'ether was refunded twice');
        })
            .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');
        })
    });
    
    it('should not allow to refund ether for account who did not invest', function() {
        return DatariusICOContract.refundEther(
            {
                from: notInvestor
            }
        ) 
        .then(function() {
            assert(false, 'ether was refunded to account that did not invest');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        })
    });
});
