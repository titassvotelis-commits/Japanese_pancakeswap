export const GRAPH_API_PROFILE = process.env.REACT_APP_GRAPH_API_PROFILE
export const GRAPH_API_PREDICTION = process.env.REACT_APP_GRAPH_API_PREDICTION
export const GRAPH_API_LOTTERY = process.env.REACT_APP_GRAPH_API_LOTTERY
export const SNAPSHOT_VOTING_API = process.env.REACT_APP_SNAPSHOT_VOTING_API
export const SNAPSHOT_BASE_URL = process.env.REACT_APP_SNAPSHOT_BASE_URL
export const API_PROFILE = process.env.REACT_APP_API_PROFILE
export const API_NFT = process.env.REACT_APP_API_NFT
export const SNAPSHOT_API = `${SNAPSHOT_BASE_URL}/graphql`
export const SNAPSHOT_HUB_API = `${SNAPSHOT_BASE_URL}/api/message`
export const BITQUERY_API = 'https://graphql.bitquery.io'

/**
 * V1 will be deprecated but is still used to claim old rounds
 */
export const GRAPH_API_PREDICTION_V1 = 'https://api.thegraph.com/subgraphs/name/pancakeswap/prediction'

/** PancakeSwap V2 exchange subgraph (StreamingFast URL is deprecated). Override via REACT_APP_GRAPH_EXCHANGE. */
export const INFO_CLIENT =
  process.env.REACT_APP_GRAPH_EXCHANGE ?? 'https://proxy-worker-api.pancakeswap.com/bsc-exchange'
export const BLOCKS_CLIENT = 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks'
export const GRAPH_API_NFTMARKET = process.env.REACT_APP_GRAPH_API_NFT_MARKET
