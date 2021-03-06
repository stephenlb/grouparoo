import faker from "faker";
import { Export } from "./../../src/models/Export";
import DestinationFactory from "./destination";
import ProfileFactory from "./profile";

const data = async (props = {}) => {
  const defaultProps = {
    oldProfileProperties: {},
    newProfileProperties: {},
    oldGroups: [],
    newGroups: [],

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return Object.assign({}, defaultProps, props);
};

export default async (
  profile?,
  destination?,
  props: { [key: string]: any } = {}
) => {
  if (!profile) {
    profile = await ProfileFactory();
  }

  if (!destination) {
    destination = await DestinationFactory();
  }

  props.profileGuid = profile.guid;
  props.destinationGuid = destination.guid;

  const mergedProps = await data(props);
  const instance = new Export(mergedProps);
  await instance.save();

  return instance;
};
