# Datarius ICO Contract

Please see below description of [Datarius ICO][datarius] smart contract developed by [Phenom.Team][phenom]. Contract on [etherscan][link].


## Overview
DTRC Token smart-contract is structured upon [ERC20 standard](erc20). 
One of distinctive features of the smart-contract is the fact that token price is fixed and pegged to USD instead of ETH which protects investors from volatility risks of ETH currency. This technical feature is made possible by usage of Oracle that updates ETH/USD actual exchange rate in the smart contract every 30 minutes. The token price is set to $0.01 apiece.

Ethereum is not the only currency investors can use when investing, they can also opt to purchase DTRC tokens with BTC, LTC, BCC and even USD (in debit cards). Processing of transactions in these currencies is enabled by automated platform, which processes every single incoming transaction and calculates it's USD equivalent. It also tracks number of confirmations of every single transaction and emits tokens to Ethereum address of an investor, he specified in his personal profile web page. Emission itself is processed by bringing up of buyForInvestor method directly from cotroller-addresses (controllersOnly). In order to ensure smooth real-time emission of DTRC tokens, a unique sharding technology developed by  [Phenom.Team][phenom] is used. The basics of the technology boils down to the procedure wherein the whole emission process is distributed among three controller-addresses, which allows to perform fast real-time token emission  even when the whole Ethereum network is overloaded.
In the case of failure to reach the Soft Cap all investments will be returned. 

-	For ETH investments: all tokens stashed on investor’s address get burned and invested ETH forwared back to investor’s wallet from DatariusICO smart-contract.
-	BTC, LTC, BCC investments: refund process is powered by Oracle. The investment amount get refunded back to investor’s wallet, minus transaction fee. 
 
## The Crowdsale Specification
*	DTRC token is ERC-20 compliant.
*	Soft Cap: $1,000,000.
*	Hard Cap: $51,000,000.
*   Allocation of DTRC tokens goes in the following way:
	* Bounty 2%
	* Partners 5%
	* Team 5%
	* Reserve fund 15%
	* Public ICO 73%

## Code

####  DatariusICO Functions

**Fallback function**
```cs
function() external payable
```
Fallback function calls buy(address _investor, uint _DTRCValue) function to issue tokens when investor sends ETH directly to ICO smart contract address.

**setRate**
```cs
function setRate(uint _rateEth) external oracleOnly
```
Set ETH/USD exchange rate and update token price.

**startIco**
```cs
function startIco() external managersOnly 
```
Set ICO status to Started.

**pauseIco**
```cs
function pauseIco() external managersOnly 
```
Set ICO status to Paused.

**finishIco**
```cs
function finishIco() external managersOnly
```
Finish ICO and allocate tokens for bounty company, partners and team pools.

**swapTokens**
```cs
function swapTokens(address _investor) external managersOnly
```
Function to swap tokens from pre-sale.

**buyForInvestor**
```cs
function buyForInvestor(address _investor, uint _DTRCValue, string _txHash) external controllersOnly 
```
Function to issues tokens for investors who made purchases in other cryptocurrencies.

**getBonus**
```cs
function getBonus(uint _value) public constant returns (uint) 
```
get current bonus

**returnEther**
```cs
function returnEther() public
```
Allows investors to return their investments(in ETH) if the SoftCap was not achieved and burns tokens.


**returnOtherCrypto**
```cs
function refundOtherCrypto(address _investor, string _logString) public refundManagersOnly
```
This method is called if the soft cap was not achieved by refund manager to burn tokens of investors who want to revoke their investments in other cryptocurrencies.

**withdrawEther**
```cs
function withdrawEther() external managersOnly
```
Allows Company withdrawing investments when ICO is over and soft cap achieved

#### DatariusICO Events

**LogStartICO**
```cs
event LogStartICO();
```
**LogPauseICO**
```cs
event LogPauseICO();
```

**LogFinishICO**
```cs
event LogFinishICO();
```
**LogSwapTokens**
```cs
event LogSwapTokens(address investor, uint tokensAmount);
```

**LogBuyForInvestor**
```cs
event LogBuyForInvestor(address investor, uint DTRCValue, string txHash);
```
**LogReturnEth**
```cs
event LogReturnEth(address investor, uint eth);
```
**LogReturnOtherCrypto**
```cs
event LogReturnOtherCrypto(address investor, string logString);
```

## Prerequisites
1. nodejs, and make sure it's version above 8.0.0
2. npm
3. truffle
4. testrpc

## Run tests
1. run `testrpc -a 15 -l 5000000` in terminal
2. run `truffle test` in another terminal to execute tests.


## Collaborators

* **[Alex Smirnov](https://github.com/AlekseiSmirnov)**
* **[Max Petriev](https://github.com/maxpetriev)**
* **[Dmitriy Pukhov](https://github.com/puhoshville)**
* **[Kate Krishtopa](https://github.com/Krishtopa)**

[link]: https://etherscan.io/address/0x5a8ffa5f2ce95b3a397bda16ad84781b6fde4f8b#code
[datarius]: https://datarius.io/ru
[phenom]: https://phenom.team/
[erc20]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md