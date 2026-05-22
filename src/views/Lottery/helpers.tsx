import BigNumber from 'bignumber.js'
import { LotteryResponse, LotteryRound, LotteryRoundUserTickets } from 'state/types'

/**
 * Remove the '1' and reverse the digits in a lottery number retrieved from the smart contract
 */
export const parseRetrievedNumber = (number: string): string => {
  const numberAsArray = number.split('')
  numberAsArray.splice(0, 1)
  numberAsArray.reverse()
  return numberAsArray.join('')
}

export const getDrawnDate = (endTime: string) => {
  const endTimeInMs = parseInt(endTime, 10) * 1000
  const endTimeAsDate = new Date(endTimeInMs)
  return endTimeAsDate.toLocaleDateString(undefined, dateTimeOptions)
}

export const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export const timeOptions: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
}

export const dateTimeOptions: Intl.DateTimeFormatOptions = {
  ...dateOptions,
  ...timeOptions,
}

export const processLotteryResponse = (
  lotteryData: LotteryResponse & { userTickets?: LotteryRoundUserTickets },
): LotteryRound => {
  const {
    priceTicketInOpt: priceTicketInOptAsString,
    discountDivisor: discountDivisorAsString,
    amountCollectedInOpt: amountCollectedInOptAsString,
  } = lotteryData

  const discountDivisor = new BigNumber(discountDivisorAsString)
  const priceTicketInOpt = new BigNumber(priceTicketInOptAsString)
  const amountCollectedInOpt = new BigNumber(amountCollectedInOptAsString)

  return {
    isLoading: lotteryData.isLoading,
    lotteryId: lotteryData.lotteryId,
    userTickets: lotteryData.userTickets,
    status: lotteryData.status,
    startTime: lotteryData.startTime,
    endTime: lotteryData.endTime,
    priceTicketInOpt,
    discountDivisor,
    treasuryFee: lotteryData.treasuryFee,
    firstTicketId: lotteryData.firstTicketId,
    lastTicketId: lotteryData.lastTicketId,
    amountCollectedInOpt,
    finalNumber: lotteryData.finalNumber,
    strPerBracket: lotteryData.strPerBracket,
    countWinnersPerBracket: lotteryData.countWinnersPerBracket,
    rewardsBreakdown: lotteryData.rewardsBreakdown,
  }
}
