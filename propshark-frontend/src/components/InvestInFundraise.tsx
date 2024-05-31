import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { DialogHeader, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { test } from "@/app/api/approve-fundraiser/routes"
import { useState } from "react"
import { TransactionBlock } from "@mysten/sui.js/transactions"

interface InvestInFundraiseProps {
    address: string
    house_name: string
}

export default function InvestInFundraise({ address, house_name }: InvestInFundraiseProps) {
    const [state, set_state] = useState("")


    return (
    <Dialog>
      <DialogTrigger>
        <Button>Participate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invest in the Fundraise</DialogTitle>
          <DialogDescription>
            Choose how much to invest in the fundraise
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Investment Amount
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
              onChange={ev => {
                set_state(ev.target.value)
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => {
            test(house_name, address)
            //fetch("/api/approve-fundraiser", {
            //    body: JSON.stringify({
            //        address, house_name
            //    }),method: "POST"
            //})
          }}>Invest</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}