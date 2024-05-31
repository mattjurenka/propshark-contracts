import { Button } from "./ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export default function GovernanceModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Governance</Button>
      </DialogTrigger>
      <DialogContent className="h-screen flex flex-col">
        <DialogHeader>
          <DialogTitle>Governance</DialogTitle>
          {/*<DialogDescription>
            View past proposals, and vote on futures ones
  </DialogDescription>*/}
        </DialogHeader>
        <div className="h-full flex flex-col justify-center">
          <h1 className="text-center text-lg font-bold">Current Proposal</h1>
          <h1 className="text-center text-2xl font-bold mb-4">Property Sale to Birdman Corporation for $1,200,000</h1>
          <Button variant={"outline"} onClick={() => window.open("/proposal.pdf", "_blank")}>View Full Proposal Text</Button>
          <div className="flex mb-1 mt-4">
            <p className="text-normal">Available Voting Power: </p>
            <p className="font-bold text-xl ml-auto">3.42%</p>
          </div>
          <div className="flex mb-1">
            <p className="text-normal">Voting Ends:</p>
            <p className="font-bold text-xl ml-auto">6/3/2024</p>
          </div>
          <div className="flex mb-4">
            <p className="text-normal">Needed to Pass</p>
            <p className="font-bold text-xl ml-auto">66.7+%</p>
          </div>
          <div className="flex justify-between">
            <div className="bg-[#50C878] py-3 px-4 rounded-xl text-center">
              <h1 className="font-bold text-sm">Yes</h1>
              <h1 className="font-bold text-xl">32.4%</h1>
            </div>
            <div className="bg-[#ff2400] py-3 px-4 rounded-xl text-center">
              <h1 className="font-bold text-sm">No</h1>
              <h1 className="font-bold text-xl">10.9%</h1>
            </div>
            <div className="border-2 border-black py-3 px-4 rounded-xl text-center">
              <h1 className="font-bold text-sm">Undecided</h1>
              <h1 className="font-bold text-xl">56.7%</h1>
            </div>
          </div>
          <div className="flex mt-8 gap-4">
            <Button className="w-full bg-[#50C878]">Vote Yes</Button>
            <Button className="w-full bg-[#ff2400]">Vote No</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}