import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, { set: 'mi' | 'mci'; name: string }>;

const MAPPING: IconMapping = {
  'house.fill': { set: 'mi', name: 'home' },
  'person.2.fill': { set: 'mi', name: 'groups' },
  'calendar': { set: 'mi', name: 'event' },
  'checkmark.circle.fill': { set: 'mi', name: 'check-circle' },
  'ellipsis': { set: 'mi', name: 'more-horiz' },
  'chevron.right': { set: 'mi', name: 'chevron-right' },
  'chevron.left': { set: 'mi', name: 'chevron-left' },
  'plus': { set: 'mi', name: 'add' },
  'plus.circle.fill': { set: 'mi', name: 'add-circle' },
  'qrcode': { set: 'mi', name: 'qr-code-2' },
  'bell.fill': { set: 'mi', name: 'notifications' },
  'magnifyingglass': { set: 'mi', name: 'search' },
  'pencil': { set: 'mi', name: 'edit' },
  'trash': { set: 'mi', name: 'delete' },
  'person.fill': { set: 'mi', name: 'person' },
  'person.badge.plus': { set: 'mi', name: 'person-add' },
  'person.crop.circle.badge.plus': { set: 'mi', name: 'person-add' },
  'phone.fill': { set: 'mi', name: 'phone' },
  'envelope.fill': { set: 'mi', name: 'email' },
  'mappin': { set: 'mi', name: 'location-on' },
  'location.fill': { set: 'mi', name: 'my-location' },
  'clock': { set: 'mi', name: 'access-time' },
  'clock.arrow.circlepath': { set: 'mi', name: 'history' },
  'gearshape.fill': { set: 'mi', name: 'settings' },
  'lock.fill': { set: 'mi', name: 'lock' },
  'eye.fill': { set: 'mi', name: 'visibility' },
  'eye.slash.fill': { set: 'mi', name: 'visibility-off' },
  'rectangle.portrait.and.arrow.right': { set: 'mi', name: 'logout' },
  'chart.bar.fill': { set: 'mi', name: 'bar-chart' },
  'list.bullet': { set: 'mi', name: 'list' },
  'camera.fill': { set: 'mi', name: 'photo-camera' },
  'xmark': { set: 'mi', name: 'close' },
  'checkmark': { set: 'mi', name: 'check' },
  'doc.text': { set: 'mi', name: 'description' },
  'info.circle': { set: 'mi', name: 'info' },
  'questionmark.circle': { set: 'mi', name: 'help' },
  'paintbrush': { set: 'mi', name: 'palette' },
  'share': { set: 'mi', name: 'share' },
  'fullscreen': { set: 'mi', name: 'fullscreen' },
  'arrow.left': { set: 'mi', name: 'arrow-back' },
  'person.circle': { set: 'mi', name: 'account-circle' },
  'car.fill': { set: 'mci', name: 'rickshaw' },
  'banknote.fill': { set: 'mi', name: 'payments' },
  'wrench.and.screwdriver.fill': { set: 'mi', name: 'build' },
  'square.and.arrow.up': { set: 'mi', name: 'upload' },
  'map.fill': { set: 'mi', name: 'map' },
  'star.fill': { set: 'mi', name: 'star' },
  'photo': { set: 'mi', name: 'photo' },
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const mapped = MAPPING[name] ?? { set: 'mi' as const, name: 'circle' };
  if (mapped.set === 'mci') {
    return (
      <MaterialCommunityIcons
        color={color as string}
        size={size}
        name={mapped.name as any}
        style={style}
      />
    );
  }
  return (
    <MaterialIcons color={color} size={size} name={mapped.name as any} style={style} />
  );
}
