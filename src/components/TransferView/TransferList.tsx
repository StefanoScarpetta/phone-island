// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useState, FormEvent, useRef } from 'react'
import { Button } from '../Button'
import { RootState } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { backToCallView } from '../../lib/island/island'
import ListAvatar from './ListAvatar'
import { faPhone as faPhoneLight, faArrowLeft } from '@nethesis/nethesis-light-svg-icons'
import { UserEndpointsTypes, UsersEndpointsTypes } from '../../types'
import { attendedTransfer } from '../../lib/phone/call'
import { Dispatch } from '../../store'
import { getTimestampInSeconds } from '../../utils/genericFunctions/timestamp'
import Hangup from '../Hangup'

const USERS_NUMBER_PER_PAGE = 10
const SHOW_LIST_GRADIENT_DISTANCE = 3

export const TransferListView: FC<TransferListViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { endpoints } = useSelector((state: RootState) => state.users)
  const { username } = useSelector((state: RootState) => state.currentUser)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [listUsers, setListUsers] = useState<UserEndpointsTypes[]>([])
  const searchValue = useRef<string>('')
  const [showCustomUser, setShowCustomUser] = useState<boolean>()
  const relativeRef = useRef<HTMLDivElement>(null)
  const [showGradient, setShowGradient] = useState<boolean>(false)
  const [showingUsers, setShowingUsers] = useState<number>(USERS_NUMBER_PER_PAGE)
  const dispatch = useDispatch<Dispatch>()
  const { displayName, number, startTime } = useSelector((state: RootState) => state.currentCall)

  function handleChange(event: FormEvent<HTMLInputElement>) {
    // Update search value
    searchValue.current = event.currentTarget.value
    // Filter the users list
    endpoints && setListUsers(filterUsers(endpoints))
    // Check if custom user to call must be visible
    if (/^[0-9*#+]+$/.test(searchValue.current)) {
      setShowCustomUser(true)
    } else {
      setShowCustomUser(false)
    }
  }

  function filterUsers(endpoints: UsersEndpointsTypes) {
    // Remove the currentUser from the list
    username && delete endpoints[username]
    // Filter the users
    return Object.values(endpoints).filter(
      (userEndpoints: UserEndpointsTypes) =>
        userEndpoints.endpoints.extension.find((extension) =>
          extension.id.toLowerCase().startsWith(searchValue.current.toLowerCase()),
        ) ||
        userEndpoints.username.toLowerCase().startsWith(searchValue.current.toLowerCase()) ||
        userEndpoints.name.toLowerCase().startsWith(searchValue.current.toLowerCase()),
    )
  }

  async function handleAttendedTransfer(userEndpoints: UserEndpointsTypes) {
    // Check user's main status
    if (userEndpoints.mainPresence !== 'online') return
    // Send attended transfer message
    const transferring = await attendedTransfer(userEndpoints.endpoints.mainextension[0].id)
    if (transferring) {
      dispatch.island.setIslandView('call')
      // Force current call to achieve the expected behavior
      dispatch.currentCall.updateCurrentCall({
        username: userEndpoints.username,
        displayName: userEndpoints.name,
        number: userEndpoints.endpoints.mainextension[0].id,
        startTime: `${getTimestampInSeconds()}`,
        transferring: true,
        transferringName: displayName,
        transferringNumber: number,
        transferringStartTime: startTime,
      })
    }
  }

  // Initialize users list
  useEffect(() => {
    if (endpoints && username) {
      setListUsers(filterUsers(endpoints))
      setLoaded(true)
    }
  }, [endpoints, username])

  useEffect(() => {
    // Handle users list scrolling
    const handleScroll = () => {
      setShowGradient(
        relativeRef.current && relativeRef.current.scrollTop > SHOW_LIST_GRADIENT_DISTANCE
          ? true
          : false,
      )
      // Manage scroll to bottom
      if (
        relativeRef.current &&
        relativeRef.current?.offsetHeight + relativeRef.current?.scrollTop >=
          relativeRef.current?.scrollHeight - 10
      ) {
        // Improve showing users
        setShowingUsers((state) => state + USERS_NUMBER_PER_PAGE)
      }
    }
    // Manage expansion and collapsing
    if (isOpen) {
      relativeRef.current?.addEventListener('scroll', handleScroll)
    } else {
      relativeRef.current?.removeEventListener('scroll', handleScroll)
    }
    return () => relativeRef.current?.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  return (
    <>
      {isOpen ? (
        <div className='pi-relative pi-flex pi-flex-col pi-gap-7'>
          <div className='pi-flex pi-gap-4'>
            <Button variant='transparent' onClick={backToCallView}>
              <FontAwesomeIcon size='xl' icon={faArrowLeft} />
            </Button>
            <input
              data-stop-propagation={true}
              type='text'
              onChange={handleChange}
              value={searchValue.current}
              placeholder='Search or compose...'
              autoFocus
              spellCheck={false}
              className='pi-w-full pi-rounded-full pi-bg-black pi-border-2 pi-border-emerald-500 active:pi-border-emerald-500 focus:pi-border-emerald-500 pi-text-white pi-font-sans pi-font-light pi-text-xl pi-text-center pi-px-2 focus:pi-outline-0 focus:pi-ring-0'
            />
          </div>
          <div
            style={{ height: '272px' }}
            ref={relativeRef}
            className='pi-relative pi-w-full pi-flex pi-flex-col pi-gap-2 pi-overflow-y-auto pi-overflow-x-hidden pi-custom-scrollbar'
          >
            {showGradient && (
              <div
                style={{ right: '35px', left: '35px' }}
                className='pi-fixed pi-z-10 pi-h-6 pi-bg-gradient-to-b pi-from-black pi-to-transparent pi-pointer-events-none'
              ></div>
            )}
            {/* The custom user */}
            {showCustomUser && listUsers.length === 0 && (
              <div className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'>
                <div className='pi-flex pi-items-center pi-gap-4'>
                  <ListAvatar />
                  <div
                    style={{ maxWidth: '146px' }}
                    className='pi-h-fit pi-max-w-40 pi-font-sans pi-truncate pi-text-sm pi-font-bold'
                  >
                    {searchValue.current}
                  </div>
                </div>
                <div className='pi-flex pi-gap-3.5'>
                  <Button onClick={() => attendedTransfer(searchValue.current)} variant='default'>
                    <FontAwesomeIcon size='xl' icon={faPhoneLight} />
                  </Button>
                </div>
              </div>
            )}
            {/* The users list */}
            {listUsers &&
              listUsers.slice(0, showingUsers).map((userEndpoints, i) => (
                <div
                  key={i}
                  className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1'
                >
                  <div className='pi-flex pi-items-center pi-gap-4'>
                    <ListAvatar
                      onClick={() => handleAttendedTransfer(userEndpoints)}
                      username={userEndpoints.username}
                      status={userEndpoints.mainPresence}
                    />
                    <div
                      onClick={() => handleAttendedTransfer(userEndpoints)}
                      style={{ maxWidth: '196px' }}
                      data-stop-propagation={true}
                      className={`pi-h-fit pi-font-sans pi-truncate pi-text-sm pi-font-bold pi-text-gray-200 pi-transition ${
                        userEndpoints.mainPresence !== 'online' ? 'pi-opacity-70' : 'hover:pi-text-white'
                      }`}
                    >
                      {/* The name */}
                      {userEndpoints.name}
                    </div>
                  </div>
                  <div className='pi-flex pi-gap-3.5'>
                    <Button
                      onClick={() => handleAttendedTransfer(userEndpoints)}
                      variant='default'
                      disabled={userEndpoints.mainPresence !== 'online'}
                    >
                      <FontAwesomeIcon size='xl' icon={faPhoneLight} />
                    </Button>
                  </div>
                </div>
              ))}
            {loaded && listUsers.length === 0 && !showCustomUser && (
              <p className='pi-font-sans pi-font-bold pi-w-full pi-flex pi-justify-center pi-text-sm'>
                No users found.
              </p>
            )}
          </div>
          <Hangup />
        </div>
      ) : (
        <div className='pi-font-medium pi-text-base pi-font-sans'>Transfer</div>
      )}
    </>
  )
}

interface TransferListViewProps {}
