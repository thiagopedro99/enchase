import { Button, Combobox, DatePicker, Menu, useToast } from 'enchase'
import { ChevronDownIcon } from 'enchase/icons'

import { actions, defaultDate, defaultFramework, frameworks, keys } from './defaultData.ts'
import styles from './styles.module.css'

const KeyboardDemo = () => {
  const toast = useToast()
  const items = actions.map(({ id, label }) => ({ id, label, onSelect: () => toast.info(`${label}: é só um exemplo.`, 3000) }))

  return (
    <div className={styles.demo}>
      <div className={styles.fields}>
        <Combobox label="Framework" options={frameworks} defaultValue={defaultFramework} fullWidth />
        <DatePicker label="Entrega" defaultValue={defaultDate} fullWidth />
        <Menu label="Ações do projeto" items={items}>
          <Button variant="outline">
            Ações
            <ChevronDownIcon size={16} />
          </Button>
        </Menu>
      </div>

      <ul className={styles.keys} aria-label="Teclas que funcionam nestes campos">
        {keys.map((key) => (
          <li key={key}>
            <kbd className={styles.key}>{key}</kbd>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default KeyboardDemo
