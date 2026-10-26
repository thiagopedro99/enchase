import { useState } from 'react'

import { Button, Checkbox, Input, Modal, Select } from 'enchase'
import { countryOptions } from './defaultData.ts'
import styles from './styles.module.css'

export const LiveStrip = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className={styles.row} data-align="flex-start">
        <Input label="Email" helperText="We never share your email" />
        <Input label="Password" type="password" />
        <Select label="Country" placeholder="Select..." options={countryOptions} defaultValue="" />
        <Checkbox label="I accept the terms" />
      </div>

      <div className={styles.row}>
        <Button variant="secondary" onClick={() => setModalOpen(true)} aria-haspopup="dialog">
          Open modal
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button>
          </>
        }
      >
        <Input label="Name" fullWidth />
      </Modal>
    </div>
  )
}

export default LiveStrip
