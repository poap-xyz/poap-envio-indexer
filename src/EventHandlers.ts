/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features.
 */
import {
  AdminUpgradeabilityProxy,
  AdminUpgradeabilityProxy_AdminAdded,
  AdminUpgradeabilityProxy_AdminChanged,
  AdminUpgradeabilityProxy_AdminRemoved,
  AdminUpgradeabilityProxy_Approval,
  AdminUpgradeabilityProxy_ApprovalForAll,
  AdminUpgradeabilityProxy_EventMinterAdded,
  AdminUpgradeabilityProxy_EventMinterRemoved,
  AdminUpgradeabilityProxy_EventToken,
  AdminUpgradeabilityProxy_Paused,
  AdminUpgradeabilityProxy_Transfer,
  AdminUpgradeabilityProxy_Unpaused,
  AdminUpgradeabilityProxy_Upgraded,
} from "generated";

AdminUpgradeabilityProxy.AdminAdded.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_AdminAdded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.AdminUpgradeabilityProxy_AdminAdded.set(entity);
});

AdminUpgradeabilityProxy.AdminChanged.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_AdminChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousAdmin: event.params.previousAdmin,
    newAdmin: event.params.newAdmin,
  };

  context.AdminUpgradeabilityProxy_AdminChanged.set(entity);
});

AdminUpgradeabilityProxy.AdminRemoved.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_AdminRemoved = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.AdminUpgradeabilityProxy_AdminRemoved.set(entity);
});

AdminUpgradeabilityProxy.Approval.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_Approval = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    approved: event.params.approved,
    tokenId: event.params.tokenId,
  };

  context.AdminUpgradeabilityProxy_Approval.set(entity);
});

AdminUpgradeabilityProxy.ApprovalForAll.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_ApprovalForAll = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    operator: event.params.operator,
    approved: event.params.approved,
  };

  context.AdminUpgradeabilityProxy_ApprovalForAll.set(entity);
});

AdminUpgradeabilityProxy.EventMinterAdded.handler(
  async ({ event, context }) => {
    const entity: AdminUpgradeabilityProxy_EventMinterAdded = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      eventId: event.params.eventId,
      account: event.params.account,
    };

    context.AdminUpgradeabilityProxy_EventMinterAdded.set(entity);
  }
);

AdminUpgradeabilityProxy.EventMinterRemoved.handler(
  async ({ event, context }) => {
    const entity: AdminUpgradeabilityProxy_EventMinterRemoved = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      eventId: event.params.eventId,
      account: event.params.account,
    };

    context.AdminUpgradeabilityProxy_EventMinterRemoved.set(entity);
  }
);

AdminUpgradeabilityProxy.EventToken.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_EventToken = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    eventId: event.params.eventId,
    tokenId: event.params.tokenId,
  };

  context.AdminUpgradeabilityProxy_EventToken.set(entity);
});

AdminUpgradeabilityProxy.Paused.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.AdminUpgradeabilityProxy_Paused.set(entity);
});

AdminUpgradeabilityProxy.Transfer.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    tokenId: event.params.tokenId,
  };

  context.AdminUpgradeabilityProxy_Transfer.set(entity);
});

AdminUpgradeabilityProxy.Unpaused.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.AdminUpgradeabilityProxy_Unpaused.set(entity);
});

AdminUpgradeabilityProxy.Upgraded.handler(async ({ event, context }) => {
  const entity: AdminUpgradeabilityProxy_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    implementation: event.params.implementation,
  };

  context.AdminUpgradeabilityProxy_Upgraded.set(entity);
});