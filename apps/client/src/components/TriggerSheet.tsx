/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Nodekind, NodeMetadata } from "./CreateWorkflow";
import { useState } from "react";
import { SUPPORTED_ASSETS, type PriceTriggerMetadata } from "common/types";
import { type TimerNodeMetadata } from "common/types";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const SUPPORTED_TRIGGERS = [
  {
    id: "timer",
    title: "Timer",
    Description: "run this trigger every X second/minutes",
  },
  {
    id: "price-trigger",
    title: "Price Trigger",
    Description:
      "runs whenever the price goes above or below a certain number for an asset",
  },
];

export const TriggerSheet = ({
  onSelect,
  open,
  setOpen,
}: {
  onSelect: (kind: Nodekind, metadata: NodeMetadata) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [metadata, SetMetadata] = useState<
    PriceTriggerMetadata | TimerNodeMetadata
  >({
    time: 3600,
  });
  const [selectedTrigger, setSelectedTrigger] = useState(
    SUPPORTED_TRIGGERS[0].id
  );
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Trigger</SheetTitle>
          <SheetDescription>Select the trigger that will start your workflow.</SheetDescription>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <div>
            <Label className="mb-2">Trigger Type</Label>
            <Select
              value={selectedTrigger}
              onValueChange={(value) => setSelectedTrigger(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SUPPORTED_TRIGGERS.map(({ id, title }) => (
                    <SelectItem key={id} value={id}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {selectedTrigger === "timer" && (
            <div>
              <Label>Interval (seconds)</Label>
              <Input
                value={(metadata as any).time}
                onChange={(e) =>
                  SetMetadata((metadata) => ({
                    ...metadata,
                    time: Number(e.target.value),
                  }))
                }
              />
            </div>
          )}

          {selectedTrigger === "price-trigger" && (
            <div className="space-y-3">
              <div>
                <Label>Price</Label>
                <Input
                  type="text"
                  onChange={(e) =>
                    SetMetadata((m) => ({
                      ...m,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Asset</Label>
                <Select
                  value={(metadata as any).asset}
                  onValueChange={(value) =>
                    SetMetadata((metadata) => ({
                      ...metadata,
                      asset: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SUPPORTED_ASSETS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

        </div>

        <SheetFooter>
          <Button
            onClick={() => {
              onSelect(selectedTrigger as Nodekind, metadata);
              setOpen(false);
            }}
            type="submit"
          >
            Create Trigger
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
