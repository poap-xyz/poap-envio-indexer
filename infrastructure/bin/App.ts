#!/usr/bin/env ts-node
import * as cdk from 'aws-cdk-lib';
import { IndexerRepositoryStack } from '../lib/AppEcrRepository';

const app = new cdk.App();
new IndexerRepositoryStack(app, 'poap-envio-indexer-production', {});