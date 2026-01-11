import React from "react";
import type { Family, Children } from "../../models/event";
import type LoginInformation from "../../models/loginInformation";

interface FamilyScheduleListProps {
  families: Family[];
  disabledChildren: Set<string>;
  onToggleChild: (childId: string, familyId?: string) => void;
  user: LoginInformation | null;
}

export function FamilyScheduleList({
  families,
  disabledChildren,
  onToggleChild,
  user,
}: FamilyScheduleListProps) {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Family Schedules</h1>
      {families.map((family) => (
        <FamilyCard
          key={family._id}
          family={family}
          disabledChildren={disabledChildren}
          onToggleChild={onToggleChild}
          user={user}
        />
      ))}
    </div>
  );
}

interface FamilyCardProps {
  family: Family;
  disabledChildren: Set<string>;
  onToggleChild: (childId: string, familyId?: string) => void;
  user: LoginInformation | null;
}

function FamilyCard({
  family,
  disabledChildren,
  onToggleChild,
  user,
}: FamilyCardProps) {
  return (
    <div className="mb-4 p-2 border bg-white border-gray-300 rounded">
      <h2 className="font-bold">{family.name}</h2>
      <ul className="space-y-1 mt-2">
        {family.children.map((child: Children) => (
          <ChildToggleItem
            key={child._id}
            child={child}
            isEnabled={!disabledChildren.has(child._id + "-" + family._id)}
            onToggle={() => onToggleChild(child._id, family._id)}
          />
        ))}
        {user && (
          <ChildToggleItem
            key={user.userId}
            child={user}
            isEnabled={!disabledChildren.has(user.userId + "-" + family._id)}
            onToggle={() => onToggleChild(user.userId, family._id)}
          />
        )}
      </ul>
    </div>
  );
}

interface ChildToggleItemProps {
  child: Children | LoginInformation;
  isEnabled: boolean;
  onToggle: () => void;
}

function ChildToggleItem({ child, isEnabled, onToggle }: ChildToggleItemProps) {
  return (
    <li>
      <label className="cursor-pointer flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          className="sr-only"
          checked={isEnabled}
          onChange={onToggle}
        />
        <span
          className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-opacity"
          style={{
            backgroundColor: isEnabled
              ? child.color || "#3174ad"
              : "transparent",
            borderColor: child.color || "#3174ad",
            opacity: isEnabled ? 1 : 0.4,
          }}
        />
        <span
          className={`transition-opacity ${
            isEnabled ? "opacity-100" : "opacity-50"
          }`}
        >
          {child.name}
        </span>
      </label>
    </li>
  );
}
