import {
	Button,
	Checkbox,
	DropdownCheckboxItem,
	DropdownGroup,
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownSub,
	Field,
	Input,
	Label,
	Radio,
	RadioGroup,
	Select,
	SelectGroup,
	SelectItem,
	Switch,
	Textarea,
} from "@anyknown/ui"
import { useState } from "react"
import { Demo, Row } from "../shell"

function SearchIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	)
}

export function FormsDemos() {
	const [threshold, setThreshold] = useState("50")
	const [source, setSource] = useState("claude")
	const [model, setModel] = useState("")
	const [memories, setMemories] = useState<string[]>([])
	const [receipts, setReceipts] = useState(false)

	return (
		<>
			<Demo id="input" title="input">
				<Field label="工作區名稱" help="之後可以在設定裡改。">
					<Input placeholder="例如:anyknown" />
				</Field>
				<Input size="sm" aria-label="搜尋記憶" placeholder="搜尋記憶…" />
				<Input aria-label="搜尋 thread" placeholder="搜尋 thread…" leadingIcon={<SearchIcon />} />
				<Field label="Email" error="Email 格式不完整,少了網域。">
					<Input defaultValue="admin@anyknown" />
				</Field>
				<Input aria-label="停用" disabled defaultValue="senlima@anyknown.com" />
			</Demo>

			<Demo id="textarea" title="textarea">
				<Field label="回報問題">
					<Textarea placeholder="發生了什麼事?" />
				</Field>
				<Textarea
					aria-label="自動長高"
					autoGrow
					maxRows={8}
					defaultValue="打字時高度會跟著內容長,到上限後出現捲軸。"
					placeholder="跟同一條 thread 說話…"
				/>
				<Field label="交接備註" error="最多 200 字,目前 214 字。">
					<Textarea defaultValue="內容超過 200 字上限。" />
				</Field>
			</Demo>

			<Demo id="label" title="label / field">
				<Label htmlFor="pg-name">顯示名稱</Label>
				<Input id="pg-name" />
				<Field label="Email" required>
					<Input />
				</Field>
				<Field label="邀請碼" optional help="有邀請碼可以直接加入既有工作區。">
					<Input />
				</Field>
				<Field label="裝置名稱" disabled help="由系統偵測,無法修改。">
					<Input defaultValue="Senlima 的 MacBook" />
				</Field>
			</Demo>

			<Demo id="checkbox" title="checkbox" note="勾選 = 布織進格子,勾是縫在布上的線,跟布一起被前緣織出來。">
				<Checkbox defaultChecked label="記住這台裝置" />
				<Checkbox label="換班時通知我" description="每次 handoff 都會收到桌面通知。" />
				<Checkbox indeterminate label="全選記憶(3 / 7)" />
				<Checkbox defaultChecked disabled label="端對端加密" description="永遠開啟。" />
			</Demo>

			<Demo id="radio" title="radio" note="選中 = 鏡頭:布在後面延伸,圓形取景框的孔徑打開。">
				<RadioGroup legend="換班門檻" value={threshold} onValueChange={setThreshold}>
					<Radio value="50" label="50%(建議)" description="context 用到一半就交接,品質最穩。" />
					<Radio value="75" label="75%" />
					<Radio value="90" label="90%" description="接近上限才交接,單一 session 最長。" />
				</RadioGroup>
				<RadioGroup legend="訂閱來源" variant="card" value={source} onValueChange={setSource}>
					<Radio value="claude" label="Claude" description="用你現有的 Claude 訂閱。" />
					<Radio value="chatgpt" label="ChatGPT" description="用你現有的 ChatGPT 訂閱。" />
				</RadioGroup>
			</Demo>

			<Demo id="switch" title="switch" note="開 = 線頭滑到底,軌道織成一塊布(織法與 button 同源)。">
				<Switch defaultChecked label="語音喚醒" description="說「Anyknown」開始對話。" />
				<Switch label="開機自動啟動" />
				<Switch defaultChecked disabled label="本地儲存" description="永遠開啟,資料不離開這台電腦。" />
			</Demo>

			<Demo id="select" title="select">
				<Select
					aria-label="選擇模型"
					value={model}
					onValueChange={setModel as never}
					placeholder="選擇模型…"
					searchPlaceholder="搜尋模型…"
				>
					<SelectGroup label="Anthropic">
						<SelectItem value="fable-5" hint="最強">
							Fable 5
						</SelectItem>
						<SelectItem value="opus-5">Opus 5</SelectItem>
						<SelectItem value="sonnet-5" hint="快">
							Sonnet 5
						</SelectItem>
					</SelectGroup>
					<SelectGroup label="OpenAI">
						<SelectItem value="gpt-5.4">GPT-5.4</SelectItem>
						<SelectItem value="gpt-5.4-mini">GPT-5.4 mini</SelectItem>
					</SelectGroup>
				</Select>
				<Select
					aria-label="選擇記憶"
					multiple
					value={memories}
					onValueChange={setMemories as never}
					placeholder="選擇要帶進交接的記憶…"
					searchPlaceholder="搜尋記憶…"
				>
					<SelectGroup label="偏好">
						<SelectItem value="pnpm">偏好 pnpm</SelectItem>
						<SelectItem value="no-comment">少寫註解</SelectItem>
					</SelectGroup>
					<SelectGroup label="專案">
						<SelectItem value="cf">部署走 Cloudflare</SelectItem>
						<SelectItem value="desktop-first">先出 desktop</SelectItem>
					</SelectGroup>
				</Select>
			</Demo>

			<Demo id="dropdown" title="dropdown">
				<Row>
					<DropdownMenu trigger={<Button variant="secondary">Thread 動作</Button>}>
						<DropdownGroup label="這條 thread">
							<DropdownItem shortcut="⌘N">新增交接備註</DropdownItem>
							<DropdownItem shortcut="⌘F">搜尋這一天</DropdownItem>
							<DropdownSub label="匯出">
								<DropdownItem>Markdown</DropdownItem>
								<DropdownItem>JSON</DropdownItem>
								<DropdownSub label="範圍…">
									<DropdownItem>只有今天</DropdownItem>
									<DropdownItem>整條 thread</DropdownItem>
								</DropdownSub>
							</DropdownSub>
						</DropdownGroup>
						<DropdownSeparator />
						<DropdownCheckboxItem checked={receipts} onCheckedChange={setReceipts}>
							顯示換班回條
						</DropdownCheckboxItem>
						<DropdownItem variant="danger">刪除這一天的紀錄</DropdownItem>
					</DropdownMenu>
				</Row>
			</Demo>
		</>
	)
}
