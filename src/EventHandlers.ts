/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features.
 */
import {
  AdminUpgradeabilityProxy,
  Token,
  Account,
  Event,
  Transfer,
} from "generated";

function createEventID(event: any): string {
  return `${event.block.number.toString()}-${event.logIndex.toString()}-${event.chainId}`;
}

function createTokenID(tokenId: bigint, chainId: number): string {
  return `${tokenId.toString()}-${chainId}`;
}

function createAccountID(address: string, chainId: number): string {
  return `${address}-${chainId}`;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

AdminUpgradeabilityProxy.EventToken.handler(async ({ event, context }) => {
  let ev = await context.Event.get(createEventID(event));
  // This handler always run after the transfer handler
  let token = (await context.Token.get(
    createTokenID(event.params.tokenId, event.chainId),
  ))!;
  if (ev == null) {
    ev = {
      id: createEventID(event),
      tokenCount: BigInt(0),
      tokenMints: BigInt(0),
      transferCount: BigInt(0),
      created: BigInt(event.block.timestamp),
      chainId: event.chainId,
    } as Event;
  }

  const updatedEvent: Event = {
    ...ev,
    tokenCount: ev.tokenCount + BigInt(1),
    tokenMints: ev.tokenMints + BigInt(1),
    transferCount: ev.transferCount + BigInt(1),
  };

  const updatedToken: Token = {
    ...token,
    event_id: updatedEvent.id,
    mintOrder: updatedEvent.tokenMints,
  };

  context.Event.set(updatedEvent);
  context.Token.set(updatedToken);
});

AdminUpgradeabilityProxy.Transfer.handler(async ({ event, context }) => {
  let token = await context.Token.get(
    createTokenID(event.params.tokenId, event.chainId),
  );
  let from = await context.Account.get(
    createAccountID(event.params.from, event.chainId),
  );
  let to = await context.Account.get(
    createAccountID(event.params.to, event.chainId),
  );

  if (from == null) {
    from = {
      id: createAccountID(event.params.from, event.chainId),
      address: event.params.from,
      // The from account at least has to own one token
      tokensOwned: BigInt(1),
      chainId: event.chainId,
    };
  }
  // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
  // Avoid negative values
  const updatedFrom: Account = {
    ...from,
    tokensOwned:
      from.address != ZERO_ADDRESS
        ? from.tokensOwned - BigInt(1)
        : from.tokensOwned,
  };
  context.Account.set(updatedFrom);

  if (to == null) {
    to = {
      id: createAccountID(event.params.to, event.chainId),
      address: event.params.to,
      tokensOwned: BigInt(0),
      chainId: event.chainId,
    };
  }
  const updatedTo: Account = {
    ...to,
    tokensOwned: to.tokensOwned + BigInt(1),
  };
  context.Account.set(updatedTo);

  if (token == null) {
    token = {
      id: createTokenID(event.params.tokenId, event.chainId),
      tokenId: event.params.tokenId,
      transferCount: BigInt(0),
      created: BigInt(event.block.timestamp),
      chainId: Number(event.chainId),
    } as Token;
  }

  const updatedToken: Token = {
    ...token,
    owner_id: updatedTo.id,
    transferCount: token.transferCount + BigInt(1),
  };

  context.Token.set(updatedToken);

  if (updatedToken.event_id != null) {
    let evEntity = await context.Event.get(updatedToken.event_id as string);

    if (evEntity != null) {
      // Add one transfer
      let updatedEvEntity: Event = {
        ...evEntity,
        transferCount: evEntity.transferCount + BigInt(1),
      };

      // Burning the token
      if (updatedTo.id == ZERO_ADDRESS) {
        updatedEvEntity = {
          ...updatedEvEntity,
          tokenCount: updatedEvEntity.tokenCount - BigInt(1),
          // Subtract all the transfers from the burned token
          transferCount:
            updatedEvEntity.transferCount - updatedToken.transferCount,
        };
      }

      context.Event.set(updatedEvEntity);
    }
  }

  const transfer: Transfer = {
    id: createEventID(event),
    chainId: event.chainId,
    from_id: updatedFrom.id,
    timestamp: BigInt(event.block.timestamp),
    to_id: updatedTo.id,
    token_id: updatedToken.id,
    transaction: event.transaction.hash,
  };

  context.Transfer.set(transfer);
});
