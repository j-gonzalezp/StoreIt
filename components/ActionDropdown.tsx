"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isMainThread } from 'worker_threads'
import Image from 'next/image'
import { Models } from 'node-appwrite'
import { useState } from 'react'
import { actionsDropdownItems } from '@/constants'
import { ActionType } from '@/types'
import { constructDownloadUrl } from '@/lib/utils'
import Link from 'next/link'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { usePathname } from 'next/navigation'
import { renameFile } from '@/lib/actions/file.actions'
import { FileDetails } from './ActionsModalContent'




const ActionDropdown = ({ file }: { file: Models.Document }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [action, setAction] = useState<ActionType | null>(null)
    const [name, setName] = useState(file.name)
    const [isLoading, setIsLoading] = useState(false)
    const path = usePathname

    const closeAllModals = () => {
        setIsModalOpen(false)
        setIsDropdownOpen(false)
        setAction(null)
        setName(file.name)
        //setEmails([])
    }
    const handleAction = async () => {
        if (!action) return
        setIsLoading(true)
        let success = false
        const actions = {
            rename: () => renameFile({
                fileId: file.$id,
                name,
                extension: file.extension,
                path
            }),
            share: () => console.log("share"),
            delete: () => console.log("delete")

        }
        success = await actions[action.value as keyof typeof action]()
        if(success) closeAllModals()
            setIsLoading(false)
    }

    const renderDialogContent = () => {
        if (!action) return null
        const { value, label } = action
        return <DialogContent className="shad-dialog button">
            <DialogHeader className='flex flex-col gap-3'>
                <DialogTitle className="text-center text-light-100">
                    {label}
                </DialogTitle>
                <DialogDescription>
                    {value === 'rename' && (
                        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    )}
                    {value === 'details' &&
                    <FileDetails file={file}/>}
                </DialogDescription>
            </DialogHeader>
            {['rename', 'delete', 'share'].includes(value) && (
                <DialogFooter className="flex flex-col gap-3 md:flex-row">
                    <Button onClick={closeAllModals} className='modal-cancel-button'>
                        Cancel
                    </Button>
                    <Button onClick={handleAction} className='modal-submit-button'>
                        <p className='capitalize'>{value}
                            {isLoading && <Image src="/assets/icons/looader.svg" alt="loader" width={24}
                                height={24}
                                className='animate-spin' />}
                        </p>
                    </Button>
                </DialogFooter>
            )}
        </DialogContent>
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger className='shad-no-focus'>
                    <Image src="/assets/icons/dots.svg" alt="dots" width={34} height={34} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className='max-w-[200px] truncate'>{File.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems.map((actionItem) => (
                        <DropdownMenuItem key={actionItem.value} className="shad-dropdown-item"
                            onClick={() => {
                                setAction(actionItem)
                                if (['rename', 'share', 'delete', 'details'].includes(actionItem.value)) { setIsModalOpen(true) }
                            }}>
                            {actionItem.value === 'download' ?
                                <Link href={constructDownloadUrl(file.bucketFileId)}
                                    download={file.name}
                                    className='flex items-center gap-2'
                                >
                                    <Image src={actionItem.icon}
                                        alt={actionItem.label}
                                        width={30}
                                        height={30} />
                                    {actionItem.label}
                                </Link> : (
                                    <div className='flex items-center gap-2'>
                                        <Image src={actionItem.icon}
                                            alt={actionItem.label}
                                            width={30}
                                            height={30} />
                                        {actionItem.label}</div>)
                            }

                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {renderDialogContent()}
        </Dialog>

    )
}

export default ActionDropdown