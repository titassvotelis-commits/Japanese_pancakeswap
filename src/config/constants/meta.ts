import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const SITE_NAME = 'JNTo'

export const DEFAULT_META: PageMeta = {
  title: SITE_NAME,
  description:
    'The best AMM on Binance! Earn JNTo through yield farming, staking or win the lottery and prediction. Join the referral program. NFT is coming soon...',
  image: 'https://optimuswap.io/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${SITE_NAME}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${SITE_NAME}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${SITE_NAME}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${SITE_NAME}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${SITE_NAME}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${SITE_NAME}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${SITE_NAME}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${SITE_NAME}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${SITE_NAME}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${SITE_NAME}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${SITE_NAME}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${SITE_NAME}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${SITE_NAME}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${SITE_NAME}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${SITE_NAME}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${SITE_NAME}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${SITE_NAME}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${SITE_NAME}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('JNTo Info & Analytics')}`,
        description: 'View statistics for JNTo exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('JNTo Info & Analytics')}`,
        description: 'View statistics for JNTo exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Pools')} | ${t('JNTo Info & Analytics')}`,
        description: 'View statistics for JNTo exchanges.',
      }
    case '/nfts/profile':
      return {
        title: `${t('Your Profile')} | ${SITE_NAME}`,
      }
    default:
      return null
  }
}
