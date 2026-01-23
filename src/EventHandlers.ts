/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features.
 */
import {
  AdminUpgradeabilityProxy,
  poaps,
  collectors,
  drops_stats,
  transfers,
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
  let ev = await context.drops_stats.get(createEventID(event));
  // This handler always run after the transfer handler
  let poap = (await context.poaps.get(
    createTokenID(event.params.tokenId, event.chainId),
  ))!;
  if (ev == null) {
    ev = {
      id: createEventID(event),
      poap_count: BigInt(0),
      token_mints: BigInt(0),
      transfer_count: BigInt(0),
      created: BigInt(event.block.timestamp),
      chain_id: event.chainId,
    } as drops_stats;
  }

  const updatedEvent: drops_stats = {
    ...ev,
    poap_count: ev.poap_count + BigInt(1),
    token_mints: ev.token_mints + BigInt(1),
    transfer_count: ev.transfer_count + BigInt(1),
  };

  const updatedPoap: poaps = {
    ...poap,
    drop_id: updatedEvent.id,
    mint_order: updatedEvent.token_mints,
  };

  context.drops_stats.set(updatedEvent);
  context.poaps.set(updatedPoap);
});

AdminUpgradeabilityProxy.Transfer.handler(async ({ event, context }) => {
  let poap = await context.poaps.get(
    createTokenID(event.params.tokenId, event.chainId),
  );
  let from = await context.collectors.get(
    createAccountID(event.params.from, event.chainId),
  );
  let to = await context.collectors.get(
    createAccountID(event.params.to, event.chainId),
  );

  if (from == null) {
    from = {
      id: createAccountID(event.params.from, event.chainId),
      address: event.params.from,
      // The from account at least has to own one token
      poaps_owned: BigInt(1),
      chain_id: event.chainId,
    };
  }
  // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
  // Avoid negative values
  const updatedFrom: collectors = {
    ...from,
    poaps_owned:
      from.address != ZERO_ADDRESS
        ? from.poaps_owned - BigInt(1)
        : from.poaps_owned,
  };
  context.collectors.set(updatedFrom);

  if (to == null) {
    to = {
      id: createAccountID(event.params.to, event.chainId),
      address: event.params.to,
      poaps_owned: BigInt(0),
      chain_id: event.chainId,
    };
  }
  const updatedTo: collectors = {
    ...to,
    poaps_owned: to.poaps_owned + BigInt(1),
  };
  context.collectors.set(updatedTo);

  if (poap == null) {
    poap = {
      id: createTokenID(event.params.tokenId, event.chainId),
      token_id: event.params.tokenId,
      transfer_count: BigInt(0),
      created: BigInt(event.block.timestamp),
      chain_id: Number(event.chainId),
    } as poaps;
  }

  const updatedPoap: poaps = {
    ...poap,
    collector_address_id: updatedTo.id,
    transfer_count: poap.transfer_count + BigInt(1),
  };

  context.poaps.set(updatedPoap);

  if (updatedPoap.drop_id != null) {
    let evEntity = await context.drops_stats.get(updatedPoap.drop_id as string);

    if (evEntity != null) {
      // Add one transfer
      let updatedEvEntity: drops_stats = {
        ...evEntity,
        transfer_count: evEntity.transfer_count + BigInt(1),
      };

      // Burning the token
      if (updatedTo.id == ZERO_ADDRESS) {
        updatedEvEntity = {
          ...updatedEvEntity,
          poap_count: updatedEvEntity.poap_count - BigInt(1),
          // Subtract all the transfers from the burned token
          transfer_count:
            updatedEvEntity.transfer_count - updatedPoap.transfer_count,
        };
      }

      context.drops_stats.set(updatedEvEntity);
    }
  }

  const transfer: transfers = {
    id: createEventID(event),
    chain_id: event.chainId,
    from_address_id: updatedFrom.id,
    timestamp: BigInt(event.block.timestamp),
    block_number: BigInt(event.block.number),
    to_address_id: updatedTo.id,
    poap_id: updatedPoap.id,
    transaction: event.transaction.hash,
  };

  context.transfers.set(transfer);
});
