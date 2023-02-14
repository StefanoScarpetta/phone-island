// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import styled, { css } from 'styled-components'

interface StyledPhoneIslandProps {
  isOpen: boolean
  incoming: boolean
  openedIslandPadding: number
  accepted: boolean
  outgoing: boolean
}

export const StyledPhoneIsland = styled.div<StyledPhoneIslandProps>`
  align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  position: absolute;
  border-radius: 99px;
  background-color: #000;
  color: #fff;
  font-size: 0.75rem;
  display: grid;
  cursor: pointer;
  ${({ isOpen, accepted, incoming, outgoing }) =>
    isOpen && accepted
      ? css`
          grid-template-rows: 72px 1fr;
        `
      : isOpen && incoming
      ? css`
          grid-template-columns: 256px 114px;
        `
      : isOpen &&
        outgoing &&
        css`
          grid-template-columns: 1fr 84px;
        `}
`
interface StyledTopContentProps {
  isOpen: boolean
  incoming: boolean
  accepted: boolean
  outgoing: boolean
}

export const StyledTopContent = styled.div<StyledTopContentProps>`
  display: grid;
  grid-template-columns: ${({ isOpen, incoming, accepted, outgoing }) =>
    isOpen && !accepted && outgoing
      ? '48px 1fr'
      : isOpen && !accepted && incoming
      ? '48px 1fr 1px'
      : isOpen && accepted
      ? '48px 164px 48px'
      : !isOpen && !accepted
      ? '24px 102px'
      : '24px 66px 24px'};
  grid-gap: ${({ isOpen }) => (isOpen ? '20px' : '12px')};
  align-items: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  justify-content: center;
  width: 100%;
`

export const StyledAvatar = styled.div`
  object-fit: cover;
`

interface StyledDetailsProps {
  numberExists: boolean
}

export const StyledDetails = styled.div<StyledDetailsProps>`
  display: grid;
  align-self: center;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
`

interface StyledTimerProps {
  isOpen: boolean
}

export const StyledTimer = styled.div<StyledTimerProps>`
  font-size: ${({ isOpen }) => (isOpen ? '1.25rem' : '1.2rem')}};
  font-weight: 200;
  color: #fff;
  letter-spacing: 0.5px;
  max-width: fit-content;
`

export const StyledName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
`
