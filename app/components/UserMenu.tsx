import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { changePlant, logoutUser } from "../lib/api"
import { useRouter } from "next/dist/client/components/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { User as UserType } from "../lib/types"

interface UserMenuProps {
    alignPosition?: "start" | "end" | "center"
    alignOffset?: number
}

export default function UserMenu({alignPosition="end", alignOffset=0}: UserMenuProps) {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logoutUser()
            logout()
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out",
            })
            router.push("/login")
        } catch (error) {
            toast({
                title: "Logout Error",
                description: "An error occurred during logout",
                variant: "destructive",
            })
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
          case "admin":
            return "text-red-400"
          case "logistics":
            return "text-blue-400"
          case "supplier":
            return "text-green-400"
          default:
            return "text-gray-400"
        }
      }
    
      const handlePlantChange = async (plant: string) => {
        const plantId = plant === "GD" ? 1 : 2 
        try {
          const response = await changePlant(plantId);
          console.log("Plant change response:", response);
          
          if (response && (response as UserType).plantId === plantId) {
            toast({
              title: "Plant Changed",
              description: `You have switched to ${plant} plant`,
            })
            window.location.reload(); // Refresh to reflect plant change
          } else {
            throw new Error("Plant change failed");
          }
        } catch (error) {
          console.error("Plant change error:", error);
          toast({
            title: "Error",
            description: "Failed to change plant",
            variant: "destructive",
          })
        }
      }

    if (!user) return (
        <Skeleton className="w-32 h-8 rounded-full" />
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                className="border border-gray-600 rounded-full flex items-center px-2 md:px-4 py-1 space-x-2 text-gray-300 hover:text-white hover:bg-white/10"
            >
                <User className="h-4 w-4" />
                <span className="hidden xl:inline">{user.username}</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={alignPosition} alignOffset={alignOffset} sideOffset={5} className="w-56 bg-gray-800 border rounded-lg border-gray-700 flex flex-col">
            <DropdownMenuLabel className="text-gray-300">
                <div className="flex space-x-2">
                    <div className="p-2 border border-gray-700 rounded-lg flex flex-col justify-between text-sm font-medium">
                        {user.username}                        
                        <p className={`text-xs ${getRoleColor(user.role)} capitalize`}>{user.role}</p>
                    </div>
                    <div className="w-full pt-2 border border-gray-700 rounded-lg flex flex-col justify-center space-y-2">
                        <p className="mx-2 inline-block self-center text-sm text-gray-400 font-light text-balance">
                        {`Plant ${user.plantName ? user.plantName : user.plantId === 1 ? "GD" : "TNGA"}`}
                        </p>
                        {user.role === 'admin' && 
                        <div className="w-full border-t border-gray-700 flex flex-row items-center">
                            {["GD", "TNGA"].map((plant, index) => (
                            <button 
                                key={plant} 
                                className={`w-full text-xs font-medium px-2 py-1 
                                ${index === 0 ? "rounded-es-lg border-r border-gray-700" : "border-l border-gray-700 rounded-ee-lg"}
                                ${user.plantId === index + 1 ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-300 hover:text-white hover:bg-gray-700"}
                                `}
                                onClick={() => handlePlantChange(plant)}
                            >
                                {plant}
                            </button>
                            ))}
                        </div>
                        }
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            {user.role === "admin" && (
                <>
                <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="text-xs md:text-sm text-gray-300 flex items-center gap-2 px-2 py-1 rounded-lg dropDownMenuHover hover:text-white cursor-pointer"
                >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                </>
            )}
            <DropdownMenuItem
                onClick={handleLogout}
                className="text-xs md:text-sm text-gray-300 flex items-center gap-2 px-2 py-1 rounded-lg dropDownMenuHoverDestructive hover:text-white cursor-pointer"
            >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 
