import { IonIcon } from "@ionic/react";
import {
  personOutline,
  statsChartOutline,
  homeOutline,
  constructOutline,
  arrowUp,
  arrowDown,
} from "ionicons/icons";
import Card from "../atoms/card";

type WidgetType = "user" | "family" | "admin" | "frequency";

interface WidgetProps {
  type: WidgetType;
  amount: number;
  diff?: number;
}

const Widget = ({ type, amount, diff }: WidgetProps) => {
  const widgetConfig = {
    user: {
      title: "USERS",
      link: "See all users",
      icon: personOutline,
      iconClass: "bg-red-500/20 text-red-600",
      to: "#users",
    },
    family: {
      title: "FAMILIES",
      link: "View all families",
      icon: homeOutline,
      iconClass: "bg-yellow-500/20 text-yellow-600",
      to: undefined,
    },
    admin: {
      title: "ADMINS",
      link: "View all admins",
      icon: constructOutline,
      iconClass: "bg-green-500/20 text-green-600",
      to: undefined,
    },
    frequency: {
      title: "FREQUENCY",
      link: "See details",
      icon: statsChartOutline,
      iconClass: "bg-purple-500/20 text-purple-600",
      to: undefined,
    },
  };

  const data = widgetConfig[type];

  const isPositive = diff ?? 0 >= 0;

  return (
    <Card className="h-[100px] bg-white">
      <div className="flex flex-col justify-between">
        <span className="font-bold text-sm text-gray-400">{data.title}</span>
        <span className="text-3xl font-light">{amount}</span>
        {data.to && (
          <span className="w-max text-xs border-b border-gray-400 cursor-pointer hover:text-gray-600">
            {data.link}
          </span>
        )}
      </div>
      <div className="flex flex-col justify-between items-end">
        <div
          className={`flex items-center text-sm ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {diff && (
            <>
              <IonIcon icon={isPositive ? arrowUp : arrowDown} />
              <p>{Math.abs(diff)} %</p>
            </>
          )}
        </div>
        <IonIcon
          icon={data.icon}
          className={`text-lg p-1.5 rounded-md ${data.iconClass}`}
        />
      </div>
    </Card>
  );
};

export default Widget;
