import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { DialogHeader, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { test } from "@/app/api/approve-fundraiser/routes"

interface ApproveKycDialogProps {
    address: string
    house_name: string
}

export default function ApproveKycDialog({ address, house_name }: ApproveKycDialogProps) {
    return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Participate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>KYC Form Placeholder</DialogTitle>
          <DialogDescription>
            In order to participate in the fundraise round you must first pass a KYC check.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Bob Jones"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Country
            </Label>
            <Input
              id="username"
              defaultValue="United States"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Are you an accredited investor?
            </Label>
            <Input
              id="username"
              defaultValue="Yes"
              className="col-span-3"
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
          }}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}