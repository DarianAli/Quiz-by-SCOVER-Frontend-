export const metadata = {
    title: "Login | Quiz Scoover"
}

type propLayout = {
    children : React.ReactNode
}

const rootLayout = ({ children }: propLayout) => {
    return (
        <div>
            {children}
        </div>
    )
}

export default rootLayout