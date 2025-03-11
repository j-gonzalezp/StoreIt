import React from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import Header from '@/components/Header'
import { getCurrentUser } from '@/lib/user.actions'
import { redirect } from 'next/navigation'


const layout = async({ children }: { children: React.ReactNode }) => {
    const currentUser = await getCurrentUser()
    console.log("hola", currentUser)
    //if (!currentUser) return redirect("/sign-in")

    return (
        <main className='flex h-screen'>
            <Sidebar {...currentUser} />
            <section className='flex h-full flex-1 flex-col'>
                <MobileNavigation {...currentUser}/>
                <Header />
            </section>
            <div className='main-content' >{children}</div>
        </main>
    )
}

export default layout