import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/email/waiting-list', () => ({
  joinPostcodeWaitingList: vi.fn(),
}))

import { joinPostcodeWaitingList } from '@/lib/email/waiting-list'
import { WaitingListForm } from './waiting-list-form'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('WaitingListForm', () => {
  it('submits the email for the selected postcode and then confirms', async () => {
    vi.mocked(joinPostcodeWaitingList).mockResolvedValue({ ok: true })
    render(<WaitingListForm areaCode="BS3" />)

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'bee@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Join the waiting list' }))

    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy())
    expect(joinPostcodeWaitingList).toHaveBeenCalledWith('BS3', 'bee@example.com', '')
    expect(screen.getByRole('status').textContent).toContain('BS3')
  })

  it('shows the error and keeps the form when the action fails', async () => {
    vi.mocked(joinPostcodeWaitingList).mockResolvedValue({
      ok: false,
      error: 'Too many attempts — please try again later.',
    })
    render(<WaitingListForm areaCode="BS3" />)

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'bee@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Join the waiting list' }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.getByRole('alert').textContent).toContain('Too many attempts')
    expect(screen.getByRole('button', { name: 'Join the waiting list' })).toBeTruthy()
  })
})
