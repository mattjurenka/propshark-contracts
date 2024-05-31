import { Button } from "./ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const sells = [
  ["$754,000", "0.10%"],
  ["$740,000", "2.10%"],
  ["$734,000", "0.10%"],
  ["$731,010", "0.05%"],
  ["$730,000", "4.00%"],
]

const buys = [
  ["$729,050", "3.10%"],
  ["$728,100", "1.10%"],
  ["$727,000", "4.10%"],
  ["$726,010", "3.05%"],
  ["$725,000", "4.00%"],
]

export default function BuyAndSell() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Buy / Sell</Button>
      </DialogTrigger>
      <DialogContent className="h-screen flex flex-col">
        <DialogHeader>
          <DialogTitle>Buy and Sell</DialogTitle>
          <DialogDescription>Buy more or sell existing shares of your property</DialogDescription>
        </DialogHeader>
        <div className="h-full flex flex-col justify-center">
          <h1 className="text-lg font-bold">Orderbook Status</h1>
          <div className="flex mt-2">
            <p>Price</p>
            <p className="ml-auto">Amount</p>
          </div>
          <div className="">
            <div className="">
              {buys.map(([price, vol]) => <div className="flex">
                <p className="font-mono text-red">{price}</p>
                <p className="ml-auto font-mono text-red">{vol}</p>
              </div>)}
            </div>
            <h1 className="text-green border-y border-black">$730,000</h1>
            <div className="">
              {buys.map(([price, vol]) => <div className="flex">
                <p className="font-mono text-green">{price}</p>
                <p className="ml-auto font-mono text-green">{vol}</p>
              </div>)}
            </div>
          </div>
          <h1 className="text-lg font-bold border-b border-black mt-4">Make an Order</h1>
          <div className="flex mt-4">
            <div className="w-full">
              <p className="font-bold">Limit Price</p>
              <p className="text-xs">Valuation of 100%</p>
            </div>
            <Input defaultValue={"730000"} className="text-right"/>
          </div>
          <div className="flex mt-2">
            <div className="w-full">
              <p className="font-bold">Amount in %</p>
              <p className="text-xs">You own 3.42%</p>
            </div>
            <Input className="text-right" defaultValue={"3.42"}/>
          </div>
          <p className="mt-4 text-sm">You are placing an order to pay $24,820 for 3.42% of the property.</p>
          <div className="flex gap-4 mt-4">
            <Button className="bg-green w-full">
              Buy
            </Button>
            <Button className="bg-red w-full">
              Sell
            </Button>
          </div>
          <h1 className="text-lg font-bold border-b border-black mt-4">Your Open Orders</h1>
          <p className="text-center mt-4">No Orders</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}