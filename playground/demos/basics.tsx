import {
	Badge,
	Button,
	Card,
	Chip,
	ConfirmDialog,
	Dialog,
	DialogActions,
	DialogClose,
	DialogContent,
	DialogTrigger,
	EmptyState,
	Kbd,
	KbdGroup,
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
	Progress,
	ProgressBall,
	ProgressRing,
	Select,
	SelectItem,
	Skeleton,
	SkeletonGroup,
	Spinner,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTab,
	Text,
	ThreadSkeleton,
	Tooltip,
	useToast,
} from "@anyknown/ui"
import * as stylex from "@stylexjs/stylex"
import { color, radius, space } from "@anyknown/ui/tokens.stylex"
import { useEffect, useState } from "react"
import { Demo, Row } from "../shell"

const styles = stylex.create({
	pane: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		padding: space.md,
		overflowY: "auto",
		height: "11rem",
		scrollbarGutter: "stable",
	},
	wide: { width: "52rem" },
	both: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		overflow: "auto",
		height: "9rem",
	},
	ringRow: { display: "flex", gap: space.lg, alignItems: "center" },
})

function MemoryIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		>
			<path d="M11 12a1.5 1.5 0 1 0 1.5-1.5A4 4 0 1 0 16.5 15 6.5 6.5 0 1 1 10 5.6" />
			<path d="M10 5.6C7.5 5 5.5 5.8 4 7.5" />
			<path d="M16.5 15c1.8.3 3.3 1.5 4.5 3.5" />
		</svg>
	)
}

function useDemoProgress() {
	const [percent, setPercent] = useState(0)
	useEffect(() => {
		const id = setInterval(() => setPercent((p) => (p >= 100 ? 0 : p + 2)), 90)
		return () => clearInterval(id)
	}, [])
	return percent
}

export function BasicsDemos() {
	const { toast } = useToast()
	const percent = useDemoProgress()

	return (
		<>
			<Demo
				id="button"
				title="button"
				note="沒有 background:實心是紗織出來的。hover 帶動掃過的紗,按住把布壓出一個窩,放開回彈時光從按點掃出;拖出去放開 = 取消,不播觸發視覺。"
			>
				<Row>
					<Button>建立 thread</Button>
					<Button variant="secondary">重新命名</Button>
					<Button variant="ghost">取消</Button>
					<Button variant="dangerGhost">拒絕</Button>
					<Button variant="danger">刪除記憶</Button>
				</Row>
				<Row>
					<Button size="sm">建立 thread</Button>
					<Button size="sm" variant="secondary">
						重新命名
					</Button>
					<Button size="sm" variant="ghost">
						取消
					</Button>
					<Button size="sm" variant="danger">
						刪除記憶
					</Button>
				</Row>
				<Row>
					<Button disabled>已停用</Button>
					<Button variant="secondary" disabled>
						已停用
					</Button>
					<Button>
						<MemoryIcon />
						帶圖示
					</Button>
					<Button variant="secondary">很長的一顆按鈕,看寬布的織法有沒有接好</Button>
				</Row>
			</Demo>

			<Demo id="dialog" title="dialog">
				<Row>
					<Dialog>
						<DialogTrigger>
							<Button variant="secondary">重新命名工作區</Button>
						</DialogTrigger>
						<DialogContent title="重新命名工作區" description="新名稱會同步到所有成員的側欄與 vault 路徑。">
							<DialogActions>
								<DialogClose>
									<Button variant="ghost">取消</Button>
								</DialogClose>
								<DialogClose>
									<Button>儲存</Button>
								</DialogClose>
							</DialogActions>
						</DialogContent>
					</Dialog>
					<Dialog>
						<DialogTrigger>
							<Button variant="secondary">dialog 裡的浮層</Button>
						</DialogTrigger>
						<DialogContent title="新的執行" description="select 的選單要疊在 dialog 上面,不是被它蓋住。">
							<Select aria-label="模型" placeholder="選擇模型…">
								<SelectItem value="fable-5">Fable 5</SelectItem>
								<SelectItem value="opus-5">Opus 5</SelectItem>
							</Select>
							<DialogActions>
								<DialogClose>
									<Button variant="ghost">取消</Button>
								</DialogClose>
								<DialogClose>
									<Button>開始</Button>
								</DialogClose>
							</DialogActions>
						</DialogContent>
					</Dialog>
					<ConfirmDialog
						trigger={<Button variant="secondary">刪除記憶</Button>}
						title="刪除這則記憶?"
						description="「部署走 Cloudflare」會從工作區移除,此動作無法復原。"
						danger
						confirmLabel="刪除"
						onConfirm={() =>
							toast("已刪除「部署走 Cloudflare」", { action: { label: "復原", onClick: () => {} } })
						}
					/>
				</Row>
			</Demo>

			<Demo id="toast" title="toast" note="倒數是一條退織的線;hover 停住。">
				<Row>
					<Button variant="secondary" onClick={() => toast("交接摘要已複製")}>
						default
					</Button>
					<Button
						variant="secondary"
						onClick={() => toast.success("換班完成", { description: "3 則記憶已帶進新 thread" })}
					>
						success
					</Button>
					<Button
						variant="secondary"
						onClick={() => toast.danger("無法連到 vault", { description: "稍後會自動重試" })}
					>
						danger
					</Button>
					<Button
						variant="secondary"
						onClick={() => toast("已刪除「偏好 pnpm」", { action: { label: "復原", onClick: () => {} } })}
					>
						with action
					</Button>
				</Row>
			</Demo>

			<Demo id="tooltip" title="tooltip" note="hover 或 tab 到按鈕,延遲 400ms。">
				<Row>
					<Tooltip content="釘選這則記憶">
						<Button variant="secondary">top</Button>
					</Tooltip>
					<Tooltip content="封存 thread" side="bottom">
						<Button variant="secondary">bottom</Button>
					</Tooltip>
					<Tooltip content="回到工作區" side="left">
						<Button variant="secondary">left</Button>
					</Tooltip>
					<Tooltip content="打開 vault" side="right">
						<Button variant="secondary">right</Button>
					</Tooltip>
					<Tooltip content="產生交接摘要" shortcut={<KbdGroup keys={["⌘", "⇧", "H"]} />}>
						<Button variant="secondary">開始換班</Button>
					</Tooltip>
				</Row>
			</Demo>

			<Demo id="popover" title="popover">
				<Row>
					<Popover>
						<PopoverTrigger>
							<Button variant="secondary">部署走 Cloudflare</Button>
						</PopoverTrigger>
						<PopoverContent side="bottom" titled>
							<PopoverTitle>部署走 Cloudflare</PopoverTitle>
							<PopoverDescription>
								2026/08/12 由換班交接寫入。之後的 thread 會自動帶上這條。
							</PopoverDescription>
							<Row>
								<Button size="sm" variant="secondary">
									編輯
								</Button>
								<Button size="sm" variant="ghost">
									刪除
								</Button>
							</Row>
						</PopoverContent>
					</Popover>
				</Row>
			</Demo>

			<Demo id="tabs" title="tabs">
				<Tabs defaultValue="chat">
					<TabsList aria-label="Thread 檢視">
						<TabsTab value="chat">對話</TabsTab>
						<TabsTab value="memory">記憶</TabsTab>
						<TabsTab value="handoff">換班紀錄</TabsTab>
						<TabsTab value="files" disabled>
							檔案
						</TabsTab>
					</TabsList>
					<TabsPanel value="chat">這個 thread 目前有 12 則訊息。</TabsPanel>
					<TabsPanel value="memory">本次工作區共留下 7 條記憶。</TabsPanel>
					<TabsPanel value="handoff">昨天 18:00 由 Fable 交接給 Opus。</TabsPanel>
					<TabsPanel value="files">尚未開放。</TabsPanel>
				</Tabs>
				<Tabs defaultValue="today" variant="pills">
					<TabsList aria-label="時間範圍">
						<TabsTab value="today">今天</TabsTab>
						<TabsTab value="week">本週</TabsTab>
						<TabsTab value="all">全部</TabsTab>
					</TabsList>
					<TabsPanel value="today">今天有 3 個 thread 更新。</TabsPanel>
					<TabsPanel value="week">本週累積 18 個 thread。</TabsPanel>
					<TabsPanel value="all">工作區共 142 個 thread。</TabsPanel>
				</Tabs>
			</Demo>

			<Demo id="badge" title="badge">
				<Row>
					<Badge>草稿</Badge>
					<Badge variant="accent">進行中</Badge>
					<Badge variant="success">已交接</Badge>
					<Badge variant="danger">已中斷</Badge>
					<Badge variant="outline">唯讀</Badge>
				</Row>
				<Row>
					<Badge variant="accent" count={3}>
						等你 ·{" "}
					</Badge>
					<Badge count={12}>已讀 · </Badge>
					<Badge variant="mono">128k · 42%</Badge>
				</Row>
				<Row>
					<Badge dot="accent">Fable 在線</Badge>
					<Badge dot="faint">換班中</Badge>
					<Badge dot="danger">連線中斷</Badge>
				</Row>
				<Row>
					<Chip onRemove={() => {}} removeLabel="移除篩選:工作區 anyknown">
						工作區:anyknown
					</Chip>
					<Chip onRemove={() => {}} removeLabel="移除篩選:本週">
						本週
					</Chip>
				</Row>
			</Demo>

			<Demo id="kbd" title="kbd">
				<Row>
					<Kbd>⌘</Kbd>
					<Kbd>⇧</Kbd>
					<Kbd>Esc</Kbd>
					<Kbd>Enter</Kbd>
					<KbdGroup keys={["⌘", "N"]} />
					<KbdGroup keys={["⌘", "⇧", "P"]} />
					<KbdGroup keys={["g", "t"]} separator="然後" />
				</Row>
				<Text variant="caption">
					換班前按 <KbdGroup keys={["⌘", "⇧", "H"]} /> 可以先預覽要交接的記憶。
				</Text>
			</Demo>

			<Demo id="skeleton" title="skeleton">
				<SkeletonGroup label="載入中">
					<Skeleton />
					<Skeleton width="92%" />
					<Skeleton width="61%" />
				</SkeletonGroup>
				<ThreadSkeleton messages={1} />
			</Demo>

			<Demo
				id="progress"
				title="progress"
				note="一個凹進去的容器,裡面長出一塊布 —— 就是 button 那塊,同一組紗與落影。環形同理:布在後面,弧形只是取景框。"
			>
				<Progress value={percent} aria-label="同步 thread" valueText={`${percent}% · 3 則訊息交接中`} />
				<Row>
					<Spinner size="sm" />
					<Spinner size="md" />
					<Spinner size="lg" />
				</Row>
				<Row>
					<ProgressBall value={percent} aria-label="下載模型" />
					<Badge variant="mono">{`${percent}%`}</Badge>
				</Row>
				<Progress aria-label="整理記憶" />
				<div {...stylex.props(styles.ringRow)}>
					<ProgressRing value={42} aria-label="context 用量" valueText="128k context 已用 42%" />
				</div>
			</Demo>

			<Demo id="empty-state" title="empty-state">
				<EmptyState
					icon={<MemoryIcon />}
					title="還沒有記憶"
					description="線還沒開始織。開始第一個 thread,重要的事會自動留下來,換班時帶得走。"
					action={<Button>開始第一個 thread</Button>}
				/>
				<EmptyState
					title="找不到符合的 thread"
					description="「部署流程」沒有結果。換個關鍵字,或把篩選條件清掉再找一次。"
					action={<Button variant="ghost">清除篩選</Button>}
				/>
			</Demo>

			<Demo id="scrollbar" title="scrollbar" note="全域 CSS,不是元件:@anyknown/ui/scrollbar.css。">
				<div {...stylex.props(styles.pane)} tabIndex={0}>
					{Array.from({ length: 9 }, (_, i) => (
						<Text key={i} variant="caption">
							換班完成 · 14:32 · ctx 50% → 新 session(第 {i + 1} 列)
						</Text>
					))}
				</div>
				<div {...stylex.props(styles.both)} tabIndex={0}>
					<Card {...stylex.props(styles.wide)}>
						<Text variant="caption">
							這個容器同時有直向與橫向捲動;右下角的 corner 是透明的,不會出現一塊灰色補丁。
						</Text>
					</Card>
				</div>
			</Demo>
		</>
	)
}
