export const GradientOrbs : React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[40vh] -left-[20vw] w-[80vw] h-[80vh] bg-purple-500/20 rounded-full blur-[120px]" />
            <div className="absolute -top-[40vh] -right-[20vw] w-[80vw] h-[80vh] bg-blue-500/20 rounded-full blur-[120px]" />
        </div>
    )
}