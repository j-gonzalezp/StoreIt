"use client"
import React from 'react'
import { Dialog } from './ui/dialog'
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
  



const ActionDropdown = ({file}:{file:Models.Document}) => {
    const [isModalOpen, setIsModalOpen]=useState(false)
    const [isDropdownOpen, setIsDropdownOpen]= useState (false)
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
 
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger className='shad-no-focus'>
                    <Image src="/assets/icons/dots.svg" alt="dots" width={34} height={34}/>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className='max-w-[200px] truncate'>{File.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems.map((actionItem)=>(
                        <DropdownMenuItem key={actionItem.value}>
                            {actionItem.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

        </Dialog>

    )
}

export default ActionDropdown