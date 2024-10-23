import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { UserEntity } from '@backstage/catalog-model';
import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import { Chip } from '@material-ui/core';

// Utility to generate random colors
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

interface CustomUserEntity extends UserEntity {
  spec: UserEntity['spec'] & {
    skills?: string[];
  };
}
export const UserEntitySkillsCard = (props: { variant: InfoCardVariants }) => {
  const { entity } = useEntity<CustomUserEntity>();

  return (
    <InfoCard {...props} title="Skills">
      {Array.isArray(entity.spec.skills) &&
        entity.spec.skills.map(skill => (
          <Chip
            label={skill}
            style={{ backgroundColor: getRandomColor(), color: '#fff' }}
            key={skill}
          />
        ))}
    </InfoCard>
  );
};
