# How to run it?

- run `yarn` to install depandancies
- run `cp example.env .env`
- replace contents of `.env` file with private keys of the account you want to use

# Commands

### `balances`

To retrieve a token balance for a specific token on a specific network, you can use the `balances` command.

#### Command format:

`yarn balances --inTokenSymbol=<token> --network=<network>`

#### Options:

- `--inTokenSymbol=<token>`: (**Required**) Specify the token for which you want to get the balance. The token should be passed as a symbol, for example `ETH`.
- `--inTokenSymbol=<network>`: (**Required**) Specify the network where the token is located. The network should be passed as a string, for example `zksync`.

#### Example:

`yarn balances --inTokenSymbol=USDC --network=zksync`

### `trade`

To execute a trade of a specific token to another on a specified protocol, you can use the `trade` command.

#### Command format:

`yarn trade --protocol=<protocol> --inTokenSymbol=<token> --outTokenSymbol=<token> --percentageOfBalanceForSwap=<percentage> --poolType <type>`

#### Options:

- `--protocol=<protocol>`: (**Required**) Specify the protocol to use for the trade. The protocol should be passed as a string, for example `syncswap` or `mute`.
- `--inTokenSymbol=<token>`: (**Required**) Specify the token you want to trade from. The token should be passed as a symbol, for example `USDT`.
- `--outTokenSymbol=<token>`: (**Required**) Specify the token you want to trade to. The token should be passed as a symbol, for example `USDC`.
- `--percentageOfBalanceForSwap=<percentage>`: (**Required**) Specify the percentage of the balance of the in-token that should be swapped. The percentage should be passed as a number between 0 and 100, for example `100`.

- `--poolType` : (**Required**) Specify the pool type. It could be `0` for stable and `1` for classic.

#### Example:

`yarn trade --protocol=syncswap --inTokenSymbols='["USDC","ETH"]' --outTokenSymbols='["USDT"]' --percentageOfBalanceForSwap=40 --poolType=1`
