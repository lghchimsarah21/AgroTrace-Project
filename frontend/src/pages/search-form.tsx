import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import React, {useState} from "react";





interface SearchFormProps extends React.ComponentProps<"form"> {
    setSearchQuery: (query: string) => void;
}



export function SearchForm({setSearchQuery, ...props }: SearchFormProps) {




    const [searchValue, setSearchValue] = useState("");


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setSearchValue(e.target.value);
        setSearchQuery(e.target.value);
    }

    return (
        <form {...props}>
            <div className="relative">
                <Label htmlFor="search" className="sr-only">
                    Search
                </Label>
                <SidebarInput
                    id="search"
                    placeholder="Type to search..."
                    className="h-8 pl-7"
                    value={searchValue}
                    onChange={handleInputChange}
                />
                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
            </div>
        </form>
    )
}
